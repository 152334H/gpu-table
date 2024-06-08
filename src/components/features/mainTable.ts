export interface GPUData {
  name: string;
  citation: string;
  tdp: number;
  sms: number;
  cores_cuda: number;
  cores_tensor: number;
  register_size: number;
  cache_l1: number | null;
  cache_l2: number | null;
  fp32_general: number;
  fp16: number;
  fp16_ignore_crippled: number;
  bf16: number | null;
  bf16_ignore_crippled: number | null;
  tf32: number | null;
  int8: number | null;
  int4: number | null;
  fp8: number | null;
  fp8_ignore_crippled: number | null;
  fp6: number | null;
  fp4: number | null;
  crippled_fp32acc: boolean;
}
