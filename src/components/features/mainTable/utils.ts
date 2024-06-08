import fastJson from "fast-json-stringify";

export const stringifyVisibilityObj = fastJson({
  type: "object",
  properties: {
    name: { type: "boolean" },
    citation: { type: "boolean" },
    tdp: { type: "boolean" },
    membw: { type: "boolean" },
    vram: { type: "boolean" },
    sms: { type: "boolean" },
    cores_cuda: { type: "boolean" },
    cores_tensor: { type: "boolean" },
    register_size: { type: "boolean" },
    cache_l1: { type: "boolean" },
    cache_l2: { type: "boolean" },
    fp32_general: { type: "boolean" },
    fp16: { type: "boolean" },
    bf16: { type: "boolean" },
    tf32: { type: "boolean" },
    int8: { type: "boolean" },
    int4: { type: "boolean" },
    fp8: { type: "boolean" },
    fp6: { type: "boolean" },
    fp4: { type: "boolean" },
    crippled_fp32acc: { type: "boolean" },
  },
  required: [
    "name",
    "citation",
    "tdp",
    "membw",
    "vram",
    "sms",
    "cores_cuda",
    "cores_tensor",
    "register_size",
    "cache_l1",
    "cache_l2",
    "fp32_general",
    "fp16",
    "bf16",
    "tf32",
    "int8",
    "int4",
    "fp8",
    "fp6",
    "fp4",
    "crippled_fp32acc",
  ],
});

export const accessorToFullNameMapping = {
  name: "Name",
  tdp: "TDP (W)",
  sms: "SMs",
  vram: "VRAM",
  membw: "Memory Bandwidth",
  cores_cuda: "CUDA Cores",
  cores_tensor: "Tensor Cores",
  register_size: "Register Size",
  cache_l1: "L1 Cache",
  cache_l2: "L2 Cache",
  fp32_general: "FP32 Performance",
  fp16: "FP16 Performance",
  bf16: "BF16 Performance",
  tf32: "TF32 Performance",
  int8: "INT8 Performance",
  int4: "INT4 Performance",
  fp8: "FP8 Performance",
  fp6: "FP6 Performance",
  fp4: "FP4 Performance",
  crippled_fp32acc: "Crippled FP32 Accuracy",
  citation: "Citation",
};