"""
Creates an algorithm that takes original prompt from user and then keeps optimizing until the user is satisfied.
Assuming prompt is run on command terminal in folder.
"""
import subprocess
from PIL import Image
import os
import shutil
import image_to_prompt
import prompt_consolidation

# Defines initial prompt 
user_prompt = input("Enter prompt for image generation: ")

while True: # Repeats until user exits
    # Creates batch of 5 JPEG images 
    image_generation_command = "modal run stable_diffusion_cli.py --prompt '" + user_prompt + "'"
    image_generated = subprocess.check_output((image_generation_command), shell=True, text=True)

    # Collect paths of images that the user likes
    preferred_image_paths = []

    for i in range(5): #iterate through the 5 images
        image_path = "local_output_dir/output_0_" + str(i) + ".jpg"
        generated_image = Image.open(image_path)
        generated_image.show()
        # Asks user satisfaction (Left: Reject, Right: Like)
        user_satisfaction = input("Left for Reject, Right for Like: ")
        if user_satisfaction.lower() == "right":
            preferred_image_paths.append(image_path)

    # Asks if user wants to continue another round
    user_continue = input("Would you like to continue for another round? (Y/N): ")
    if user_continue.lower() == "n":
        break

    # Creates new, optimized image prompt
    if len(preferred_image_paths) == 0: # if all images are rejected
        user_prompt = input("Enter a more specific prompt: ")
    else:
        prompt_list = []
        for path in preferred_image_paths:
            os.environ["REPLICATE_API_TOKEN"] = "r8_LpBuIoADgxIeaDgUqo9ltQLjCJvQe6925y5Kg"
            image_prompt = image_to_prompt.generate_prompt(path)
            prompt_list.append(image_prompt)
        # string_prompt = prompt_consolidation.merge_prompt(prompt_list)
        # user_prompt = prompt_consolidation.clean_prompt(prompt_consolidation.create_prompt(string_prompt))

        print("Here are prompts generated from the images you liked: ")
        for i, prompt in enumerate(prompt_list):
            print(str(i) + ") " + prompt)
        prompt_index = int(input("Which prompt do you wish to use? Enter number: "))
        user_prompt = prompt_list[prompt_index]

    print("New prompt: " + user_prompt)
    # Clear the local_output_dir folder for new images 
    shutil.rmtree("local_output_dir")







    