import replicate

def generate_prompt(file_path):
    """
    Returns prompt generated from image (from file path)
    """
    output = replicate.run(
        "methexis-inc/img2prompt:50adaf2d3ad20a6f911a8a9e3ccf777b263b8596fbd2c8fc26e8888f8a0edbb5",
        input={"image": open(file_path, "rb")}
    )
    output = output.lstrip('\n')
    return output

#print(generate_prompt("cat.jpeg"))

