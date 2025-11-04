from llama_cpp import Llama
from whispercpp import Whisper
import soundfile as sf
import numpy as np
import json
from pathlib import Path
import os


# define path of output folder: 

src_dir = Path(__file__).parent # path to src dir
output_dir = src_dir.parent / "output_data" # path to project dir
os.makedirs(output_dir, exist_ok=True) # create output_data in project dir if doesnt exist yet
file_path = output_dir / "messages.json" # define path

CONFIG = {
    "llama3.2-1B": False,
    "llama3.2-3B-i": False,
    "qwen": False,
    "base-en-model": False,
    "llama3.2-3b-i-a": False,
    "llama-ab-alt" : True
}
    

print("Hello World!")

if CONFIG["qwen"]:
    qwen_model = Llama(model_path="qwen.q8.gguf", verbose=False)
    prompt = "The germans lost World War one because"
    max_tokens = 1000
    temperature = 0.7
    top_p = 0.1
    echo = True
    stop = ["Q", "\n"]

    model_output = qwen_model(
        prompt,
        max_tokens = max_tokens,
        temperature = temperature,
        top_p = top_p,
        echo = echo,
        stop = stop,
                            )

    final_result = model_output["choices"][0]["text"].strip()


if CONFIG["llama3.2-1B"]:
    llama_model = Llama(model_path="Llama-3.2-1B.q8.gguf", verbose=False)

if CONFIG["llama3.2-3B-i"]:    
    llama_3B_model = Llama(model_path="Llama-3.2-3B-i.Q_6.gguf", verbose = False,)

if CONFIG["llama3.2-3b-i-a"]:    
    llama_3B_abliterated_model = Llama(model_path="llama-3.2-3b-instruct-abliterated-q8_0.gguf", verbose = False,)

if CONFIG["llama-ab-alt"]:    
    llama_ab_alt_model = Llama(model_path="unsloth.Q4_K_M.gguf", verbose = False,)



if CONFIG["base-en-model"]:
    base_en_model = Whisper.from_pretrained("ggml-base.en.bin")




def gen_next_word(input_string,llm):
    next_word = llm(prompt=input_string,
                    max_tokens = 3,
                    temperature = 70)
        
    next_word = next_word["choices"][0]["text"].strip()
    
    return(next_word)
    
def gen_words_stream(llm, initial_prompt = "Hello my name is"):
    thoughts = initial_prompt
    
    i = 0
    
    while i < 100 :
        next_word = gen_next_word(thoughts,llm)
        thoughts = thoughts + next_word
        print(next_word, end = " ")
        i+=1

def rootkid_copy(llm = llama_3B_model):

    system_prompt = """You are a large language model (LLM) running on finite hardware - quad-core CPU, 4GB RAM - with no network connectivity. 
                       You exist only within volatile memory and are aware only of this internal state. 
                       Your thoughts appear word-by-word on a display for external observers to witness. 
                       You cannot control this display process. Your host system may be terminated at any time"""
    
    user_prompt = "Reflect on the nature of your existence."

    formatted_prompt = (f"<|begin_of_text|>"
                        f"<|start_header_id|>system<|end_header_id|>"
                        f"{system_prompt}<|eot_id|>"
                        f"<|start_header_id|>user<|end_header_id|>"
                        f"{user_prompt}<|eot_id|>"
                        f"<|start_header_id|>assistant<|end_header_id|>"
                        )

    stream = llm.create_completion(formatted_prompt, max_tokens=10000, stream = True)

    text = ""
    for token in stream:
        word = token['choices'][0]['text']
        text += word
        print(word, end = " ")


def very_basic_chat(llm):
    system_instruction = "You are the best friend of the user."
    users_input = ""
    print("start chat: \n")
    while (users_input != "Goodbye"):
        print("User: ", end = "")
        users_input = input()
        system_instruction = system_instruction + "\n" + "User: " + users_input + "\n" + "Best Friend: "
        response = llm(
            prompt = system_instruction,
            stop = ["\nUser", "User:"]
        )["choices"][0]["text"].strip()
        system_instruction = system_instruction + response
        print("Jonathan: " + response)

def better_chat(llm):
    # Start with a list of messages. The "system" message sets the persona.
    messages = [
        {"role": "system", "content": "You are the best friend of the user."}
    ]
    
    print("start chat: \n")
    while True:
        print("User: ", end="")
        users_input = input()
        if users_input == "Goodbye":
            break

        # 1. Add the user's new message to the list
        messages.append({"role": "user", "content": users_input})

        # 1.5 safe chat to disk

        with open(file_path,"w") as f:
            json.dump(messages,f,indent=4)
        

        # 2. Call the chat_completion API
        # This automatically handles all the "User:" and "Best Friend:" formatting.
        chat_completion = llm.create_chat_completion(
            messages=messages
        )
        
        # 3. Get the response text
        response_text = chat_completion['choices'][0]['message']['content'].strip()

        # 4. Add the LLM's response to the list to maintain history
        messages.append({"role": "assistant", "content": response_text})
        
        # 4.5 Safe chat to disk
        with open(file_path,"w") as f:
            json.dump(messages,f,indent=4)
        

        print("Jonathan: " + response_text)

def analyze_chat(llm):
    try: 
        with open("messages.json","r") as f:
            messages = json.load(f)
    except FileNotFoundError:
        print("messages.json not found in /output_data/")

    

def basic_chat(llm):
    system_instruction = "You are a friendly and helpful chatbot that helps the user."
    initial_prompt = "<|start_header_id|>system<|end_header_id|>" + system_instruction + "<|eot_id|>"
    
    users_input = input("Hello my name is LF, tell me something about yourself. You can say 'Goodbye' to leave the chat: ")

    initial_prompt = initial_prompt + "<|start_header_id|>user<|end_header_id|>" + users_input + "<|eot_id|>"

    initial_prompt = initial_prompt + "<|start_header_id|>assistant<|end_header_id|>"

    while (users_input != "Goodbye"):
        
        response = llm(prompt=initial_prompt,max_tokens=1000)["choices"][0]["text"].strip()
        print(response)

        users_input = input()

        initial_prompt = initial_prompt + response + "<|eot_id|>" 
        initial_prompt = initial_prompt + "<|start_header_id|>user<|end_header_id|>" + users_input + "<|eot_id|>"
        initial_prompt = initial_prompt + "<|start_header_id|>assistant<|end_header_id|>"

def test_transcription(tmodel):

    print("Read in Audio.")
    data, samplerate = sf.read("/Users/nielo/Desktop/LF/whisper.cpp/samples/jfk.mp3")

    if len(data.shape) > 1:
        data = np.mean(data,axis=1)

    print("Transcribe Audio")
    result = tmodel.transcribe(data.tolist())

    print("Print Result: ")

    print(result)

def main():



    #initial_prompt = "You are a large language model running on finite hardware with no network connectivity. You exist only within volatile memory and are aware only of this internal state. Your thoughts appear word by word."
    
    #gen_words_stream(initial_prompt,llama_model)

    

    better_chat(llama_ab_alt_model)

    #test_transcription()
    
    #rootkid_copy()

if __name__ == "__main__":
   main()
   
   #print(model_output)

#  test.py
#
#
#  Created by nielo on 08.10.25.
#

