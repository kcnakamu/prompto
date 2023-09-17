from __future__ import annotations

import io
import time
from pathlib import Path

from modal import Image, Stub, method


stub = Stub("stable-diffusion-cli")

# ## Model dependencies
#
# Your model will be running remotely inside a container. We will be installing
# all the model dependencies in the next step. We will also be "baking the model"
# into the image by running a Python function as a part of building the image.
# This lets us start containers much faster, since all the data that's needed is
# already inside the image.

model_id = "runwayml/stable-diffusion-v1-5"
cache_path = "/vol/cache"


def download_models():
    import diffusers
    import torch

    # Download scheduler configuration. Experiment with different schedulers
    # to identify one that works best for your use-case.
    scheduler = diffusers.DPMSolverMultistepScheduler.from_pretrained(
        model_id,
        subfolder="scheduler",
        cache_dir=cache_path,
    )
    scheduler.save_pretrained(cache_path, safe_serialization=True)

    # Downloads all other models.
    pipe = diffusers.StableDiffusionPipeline.from_pretrained(
        model_id,
        revision="fp16",
        torch_dtype=torch.float16,
        cache_dir=cache_path,
    )
    pipe.save_pretrained(cache_path, safe_serialization=True)


image = (
    Image.debian_slim(python_version="3.10")
    .pip_install(
        "accelerate",
        "diffusers[torch]>=0.15.1",
        "ftfy",
        "torchvision",
        "transformers~=4.25.1",
        "triton",
        "safetensors",
    )
    .pip_install(
        "torch==2.0.1+cu117",
        find_links="https://download.pytorch.org/whl/torch_stable.html",
    )
    .pip_install("xformers", pre=True)
    .run_function(download_models)
)
stub.image = image

# ## Using container lifecycle methods
#
# Modal lets you implement code that runs every time a container starts. This
# can be a huge optimization when you're calling a function multiple times,
# since Modal reuses the same containers when possible.
#
# The way to implement this is to turn the Modal function into a method on a
# class that also implement the Python context manager interface, meaning it
# has the `__enter__` method (the `__exit__` method is optional).
#
# We have also have applied a few model optimizations to make the model run
# faster. On an A10G, the model takes about 6.5s to load into memory, and then
# 1.6s per generation on average. On a T4, it takes 13s to load and 3.7s per
# generation. Other optimizations are also available [here](https://huggingface.co/docs/diffusers/optimization/fp16#memory-and-speed).

# This is our Modal function. The function runs through the `StableDiffusionPipeline` pipeline.
# It sends the PIL image back to our CLI where we save the resulting image in a local file.


@stub.cls(gpu="A10G")
class StableDiffusion:
    def __enter__(self):
        import diffusers
        import torch

        torch.backends.cuda.matmul.allow_tf32 = True

        scheduler = diffusers.DPMSolverMultistepScheduler.from_pretrained(
            cache_path,
            subfolder="scheduler",
            solver_order=2,
            prediction_type="epsilon",
            thresholding=False,
            algorithm_type="dpmsolver++",
            solver_type="midpoint",
            denoise_final=True,  # important if steps are <= 10
            low_cpu_mem_usage=True,
            device_map="auto",
        )
        self.pipe = diffusers.StableDiffusionPipeline.from_pretrained(
            cache_path,
            scheduler=scheduler,
            low_cpu_mem_usage=True,
            device_map="auto",
        )
        self.pipe.enable_xformers_memory_efficient_attention()

    @method()
    def run_inference(
        self, prompt: str, steps: int = 20, batch_size: int = 4
    ) -> list[bytes]:
        import torch

        with torch.inference_mode():
            with torch.autocast("cuda"):
                images = self.pipe(
                    [prompt] * batch_size,
                    num_inference_steps=steps,
                    guidance_scale=7.0,
                ).images

        # Convert to JPG bytes
        image_output = []
        for image in images:
            with io.BytesIO() as buf:
                image.save(buf, format="JPEG")
                image_output.append(buf.getvalue())
        return image_output


# This is the command we'll use to generate images. It takes a `prompt`,
# `samples` (the number of images you want to generate), `steps` which
# configures the number of inference steps the model will make, and `batch_size`
# which determines how many images to generate for a given prompt.


@stub.local_entrypoint()
def entrypoint(
    prompt: str, samples: int = 5, steps: int = 10, batch_size: int = 1
):
    print(
        f"prompt => {prompt}, steps => {steps}, samples => {samples}, batch_size => {batch_size}"
    )

    local_output_dir = "/AI_Images" # to save it to local path

    dir = Path("local_output_dir")
    if not dir.exists():
        dir.mkdir(exist_ok=True, parents=True)


    sd = StableDiffusion()
    for i in range(samples):
        t0 = time.time()
        images = sd.run_inference.remote(prompt, steps, batch_size)
        total_time = time.time() - t0
        print(
            f"Sample {i} took {total_time:.3f}s ({(total_time)/len(images):.3f}s / image)."
        )
        for j, image_bytes in enumerate(images):
            output_path = dir / f"output_{j}_{i}.jpg"
            print(f"Saving it to {output_path}")
            with open(output_path, "wb") as f:
                f.write(image_bytes)

"""
git clone https://github.com/modal-labs/modal-examples
cd modal-examples
modal run stable_diffusion_cli.py --prompt '4 cats'
"""
