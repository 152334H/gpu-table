import json

data = []
cleaned_data = []
with open("some-gpus.json", "r") as f:
    data = json.load(f)

for entry in data:
    final_fp16_value = entry["fp16"]
    if entry["crippled_fp32acc"]:
        final_fp16_value = entry["fp16"] / 2
    cleaned_data.append(
        {
            "name": entry["s"],
            "vram": entry["vram"],
            "membw": entry["membw"],
            "citation": entry["citation"],
            "tdp": entry["tdp"],
            "sms": entry["sms"],
            "cores_cuda": entry["cores_cuda"],
            "cores_tensor": entry["cores_tensor"],
            "register_size": entry["register_size"],
            "cache_l1": entry["cache_l1"],
            "cache_l2": entry["cache_l2"],
            "fp32_general": entry["fp32_general"],
            "fp16": final_fp16_value,
            "fp16_ignore_crippled": entry["fp16"],
            "bf16": final_fp16_value if entry["has_bf16"] else None,
            "bf16_ignore_crippled": entry["fp16"] if entry["has_bf16"] else None,
            "tf32": entry["fp16"] / 2 if entry["has_tf32"] else None,
            "int8": entry["fp16"] * 2 if entry["has_int8"] else None,
            "int4": entry["fp16"] * 4 if entry["has_int4"] else None,
            "fp8": final_fp16_value * 2 if entry["has_fp8"] else None,
            "fp8_ignore_crippled": entry["fp16"] * 2 if entry["has_fp8"] else None,
            "fp6": entry["fp16"] * 2 if entry["has_fp6"] else None,
            "fp4": entry["fp16"] * 4 if entry["has_fp4"] else None,
            "crippled_fp32acc": entry["crippled_fp32acc"],
        }
    )

with open("src/assets/gpu_data.json", "w") as f:
    json.dump(cleaned_data, f)
