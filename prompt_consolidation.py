""""
Combines multiple prompt to create a one sentence prompt for image generation
"""


import requests
import re

def merge_prompt(prompt_list): # Returns a string consisting of different prompts
    output = "Provide one sentence prompt for image generation: "
    for prompt in prompt_list:
        output += prompt + ", "
    return output

def create_prompt(combined_prompt): # Returns a new prompt from the string prompt
    url = "https://api.runpod.ai/v2/llama2-7b-chat/runsync"

    payload = { "input": {
            "prompt": combined_prompt,
            "sampling_params": {
                "max_tokens": 100,
                "n": 1,
                "best_of": None,
                "presence_penalty": 0,
                "frequency_penalty": 0,
                "temperature": 0.7,
                "top_p": 1,
                "top_k": -1,
                "use_beam_search": False,
                "stop": ["None"],
                "ignore_eos": False,
                "logprobs": None
            }
        } }
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "authorization": "W0NLNGEZ2R4DCHAIS3TSICMP3DKFT8OL19Y6X7CI"
    }

    response = requests.post(url, json=payload, headers=headers)

    if response.status_code == 200:
        # Parse the JSON response
        response_json = response.json()
        # Access the specific field you want 
        output_data = response_json.get("output", {}).get("text", None)

        if output_data is not None:
            return str(output_data)
        else:
            raise ValueError
    else:
        raise ValueError

def clean_prompt(input_string):
    # Define a pattern to match any character that is not a letter (uppercase or lowercase), a period, or a space
    pattern = r'[^a-zA-Z. ]'  # Include a space in the pattern

    # Use re.sub to replace the matched pattern with an empty string
    cleaned_string = re.sub(pattern, '', input_string)

    return cleaned_string



