

from dataclasses import dataclass, asdict

@dataclass
class GPUInfo:
    # shorthand && full torch name
    s: str
    name_full: str
    citation: str

    # hardware level info
    tdp: int   # in watts
    sms: int   # Streaming multiprocessors
    # all TOTAL GPU COUNT, not per SM.
    cores_cuda: int
    cores_tensor: int | None
    register_size: int | None
    #
    # threads_per_warp: int
    # warps_per_sm: int

    cache_l1: int | None
    cache_l2: int | None
    vram: int # vram
    membw: int # membw

    fp32_general: float # non-tensor flops
    fp16: float # non-sparse half-precision tensor core FLOPs

    has_bf16: bool # always == fp16
    has_tf32: bool # always == fp16 / 2
    has_int8: bool # always == fp16 * 2
    has_int4: bool # always == fp16 * 4
    has_fp8:  bool # always == fp16 * 2
    has_fp6:  bool # always == fp16 * 2
    has_fp4:  bool # always == fp16 * 4

    crippled_fp32acc: bool = False # implies bad stuff

TABLE = []
def add_gpu_info(*a,**k):
    TABLE.append(asdict(GPUInfo(*a,**k)))
BLACKWELL = dict(has_bf16=True, has_tf32=True, has_int8=True, has_int4=False, has_fp8=True, has_fp6=True, has_fp4=True)
HOPPER = dict(has_bf16=True,  has_tf32=True,  has_int8=True, has_int4=False, has_fp8=True, has_fp6=False, has_fp4=False)
ADA    = dict(has_bf16=True,  has_tf32=True,  has_int8=True, has_int4=False, has_fp8=True, has_fp6=False, has_fp4=False)
AMPERE = dict(has_bf16=True,  has_tf32=True,  has_int8=True, has_int4=True, has_fp8=False, has_fp6=False, has_fp4=False)
VOLTA  = dict(has_bf16=False, has_tf32=False, has_int8=True, has_int4=True, has_fp8=False, has_fp6=False, has_fp4=False) # UNVERIF
TURING = dict(has_bf16=False, has_tf32=False, has_int8=True, has_int4=True, has_fp8=False, has_fp6=False, has_fp4=False)

KiB,MiB,GiB = 1024, 1024*1024, 1024**3

'''The Turing SM is partitioned into four processing blocks, each with 16 FP32 Cores, 16 INT32
Cores, two Tensor Cores, one warp scheduler, and one dispatch unit. Each block includes a new
L0 instruction cache and a 64 KB register file. The four processing blocks share a combined 96 KB
L1 data cache/shared memory. Traditional graphics workloads partition the 96 KB L1/shared
memory as 64 KB of dedicated graphics shader RAM and 32 KB for texture cache and register file
spill area. Compute workloads can divide the 96 KB into 32 KB shared memory and 64 KB L1
cache, or 64 KB shared memory and 32 KB L1 cache.'''

add_gpu_info(
    "V100", "???", "https://images.nvidia.com/content/volta-architecture/pdf/volta-architecture-whitepaper.pdf#page=15",
    tdp=300, sms=80, cores_cuda=5120, cores_tensor=640, register_size=20480*KiB,  # threads_per_warp=32, warps_per_sm=64,
    cache_l2=6144*KiB, vram=16*GiB, membw=900*GiB, fp32_general=15.7e12, fp16=120e12,
    cache_l1=10240*KiB, # BACKESTIMATE from 128KB per SM, see Ampere
    **TURING,
)
add_gpu_info(
    "T4", "???", "https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/solutions/resources/documents1/Datasheet_NVIDIA_T4_Virtualization.pdf",
    tdp=70, sms=40, cores_cuda=2560, cores_tensor=320, register_size=256*KiB*40,
    vram=16*GiB, membw=320*GiB, fp32_general=8.1e12, fp16=65e12, 
    cache_l1=None, cache_l2=None,
    **TURING,
)
add_gpu_info(
    "2080ti", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/design-visualization/technologies/turing-architecture/NVIDIA-Turing-Architecture-Whitepaper.pdf#page=14",
    tdp=260, sms=68, cores_cuda=4352, cores_tensor=544, register_size=17408*1024,
    cache_l2=5632*KiB, vram=11264*MiB, membw=320*GiB, fp32_general=14.2e12, fp16=113.8e12, 
    cache_l1=None,
    **TURING, crippled_fp32acc=True,
)
add_gpu_info(
    "Q6000", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/design-visualization/technologies/turing-architecture/NVIDIA-Turing-Architecture-Whitepaper.pdf#page=14",
    tdp=260, sms=72, cores_cuda=4608, cores_tensor=576, register_size=18432*KiB,
    cache_l2=6144*KiB, vram=24*GiB, membw=672*GiB, fp32_general=16.3e12, fp16=130.5e12, 
    cache_l1=None,
    **TURING,
)
add_gpu_info(
    "Titan RTX", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=44",
    sms=72, cores_cuda=4608, cores_tensor=576,
    fp32_general=16.3e12, fp16=130.5e12, 
    vram=24*GiB, membw=672*GiB,
    cache_l1=6912*KiB, cache_l2=6144*KiB, register_size=18432*KiB,
    tdp=280,
    **TURING
)
add_gpu_info(
    "2070", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=44",
    sms=40, cores_cuda=2560, cores_tensor=320, 
    fp32_general=9.1e12, fp16=72.5e12, crippled_fp32acc=True,
    vram=8*GiB, membw=448*GiB,
    cache_l1=3840*KiB, cache_l2=4096*KiB,register_size=10240*KiB,
    tdp=215,
    **TURING,
)

add_gpu_info(
    "3070", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=44",
    sms=46, cores_cuda=5888, cores_tensor=184, # "3rd gen not 2nd gen"
    fp32_general=20.3e12, fp16=81.3e12, crippled_fp32acc=True,
    vram=8*GiB, membw=448*GiB,
    cache_l1=5888*KiB, cache_l2=4096*KiB,register_size=11776*KiB,
    tdp=220,
    **AMPERE,
)
add_gpu_info(
    "3070ti", "???", "https://www.techpowerup.com/gpu-specs/geforce-rtx-3070-ti.c3675",
    sms=48, cores_cuda=6144, cores_tensor=192, # "3rd gen not 2nd gen"
    fp32_general=21.0e12, fp16=84e12, crippled_fp32acc=True,
    vram=8*GiB, membw=608.3*GiB,
    cache_l1=48*128*KiB, cache_l2=4096*KiB,register_size=48*256*KiB,
    tdp=290,
    **AMPERE,
)
add_gpu_info(
    "3080", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=15",
    sms=68, cores_cuda=8704, cores_tensor=272, 
    fp32_general=29.8e12, fp16=119e12, crippled_fp32acc=True,
    vram=10*GiB, membw=760*GiB,
    cache_l1=8704*KiB, cache_l2=5120*KiB,register_size=17408*KiB,
    tdp=320,
    **AMPERE,
)
add_gpu_info(
    "3080ti", "???", "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf#page=32",
    sms=80, cores_cuda=10240, cores_tensor=320,
    fp32_general=34.1e12, fp16=136.4e12, crippled_fp32acc=True,
    vram=12*GiB, membw=912*GiB,
    cache_l1=128*KiB*80, cache_l2=6*MiB, register_size=20480*KiB,
    tdp=350, **AMPERE,
)
add_gpu_info(
    "3090", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=44",
    sms=82, cores_cuda=10496, cores_tensor=328,
    fp32_general=35.6e12, fp16=142e12, crippled_fp32acc=True,
    vram=24*GiB, membw=936*GiB,
    cache_l1=10496*KiB, cache_l2=6144*KiB,register_size=20992*KiB,
    tdp=350, **AMPERE,
)
add_gpu_info(
    "3090ti", "???", "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf#page=29",
    sms=84, cores_cuda=10752, cores_tensor=336,
    fp32_general=40e12, fp16=160e12, crippled_fp32acc=True,
    vram=24*GiB, membw=1008*GiB,
    cache_l1=10752*KiB, cache_l2=6144*KiB, register_size=21504*KiB,
    tdp=450, **AMPERE,
)
add_gpu_info(
    "A4000", "???", "https://www.nvidia.com/content/dam/en-zz/Solutions/gtcs21/rtx-a4000/nvidia-rtx-a4000-datasheet.pdf",
    sms=48, cores_cuda=6144, cores_tensor=192,
    fp32_general=19.2e12, fp16=76.7e12,
    vram=16*GiB, membw=448*GiB,
    cache_l1=128*64*KiB, cache_l2=4*MiB,register_size=None,
    tdp=140,
    **AMPERE,
)
add_gpu_info(
    "A4500", "???", "https://www.nvidia.com/content/dam/en-zz/Solutions/design-visualization/rtx/nvidia-rtx-a4500-datasheet.pdf",
    sms=56, cores_cuda=7168, cores_tensor=224,
    fp32_general=23.7e12, fp16=94.6e12,
    vram=20*GiB, membw=640*GiB,
    cache_l1=128*64*KiB, cache_l2=6*MiB,register_size=None,
    tdp=200,
    **AMPERE,
)
add_gpu_info(
    "A5000", "???", "https://pnypartners.com/wp-content/uploads/nvidia-rtx-a5000-datasheet.pdf",
    sms=64, cores_cuda=8192, cores_tensor=256,
    fp32_general=27.8e12, fp16=111.1e12,
    vram=24*GiB, membw=768*GiB,
    cache_l1=128*64*KiB, cache_l2=6*MiB,register_size=None,
    tdp=230,
    **AMPERE,
)
add_gpu_info(
    "A6000", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=15",
    sms=84, cores_cuda=10752, cores_tensor=336,
    fp32_general=38.7e12, fp16=154.8e12,
    vram=48*GiB, membw=768*GiB,
    cache_l1=10752*KiB, cache_l2=6144*KiB,register_size=21504*KiB,
    tdp=300,
    **AMPERE,
)
add_gpu_info(
    "A10g", "???", "https://d1.awsstatic.com/product-marketing/ec2/NVIDIA_AWS_A10G_DataSheet_FINAL_02_17_2022.pdf",
    sms=80, cores_cuda=10240, cores_tensor=320,
    fp32_general=35e12, fp16=70e12,
    vram=24*GiB, membw=600*GiB,
    cache_l1=128*72*KiB, cache_l2=6*MiB, register_size=21504*KiB,
    tdp=300,
    **AMPERE,
)
add_gpu_info(
    "A10", "???", "https://www.nvidia.com/content/dam/en-zz/Solutions/Data-Center/a10/pdf/datasheet-new/nvidia-a10-datasheet.pdf",
    sms=72, cores_cuda=9216, cores_tensor=288,
    fp32_general=31.2e12, fp16=125e12,
    vram=24*GiB, membw=600*GiB,
    cache_l1=128*72*KiB, cache_l2=6*MiB, register_size=21504*KiB,
    tdp=150,
    **AMPERE,
)
add_gpu_info(
    "A40", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/geforce/ampere/pdf/NVIDIA-ampere-GA102-GPU-Architecture-Whitepaper-V1.pdf#page=15",
    sms=84, cores_cuda=10752, cores_tensor=336,
    fp32_general=37.4e12, fp16=149.7e12,
    vram=48*GiB, membw=696*GiB,
    cache_l1=10752*KiB, cache_l2=6144*KiB,register_size=21504*KiB,
    tdp=300,
    **AMPERE,
)
add_gpu_info(
    "A100-SXM", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/data-center/nvidia-ampere-architecture-whitepaper.pdf",
    sms=108, cores_cuda=6912, cores_tensor=432,
    fp32_general=19.5e12, fp16=312e12,
    vram=80*GiB, membw=1555*GiB,
    cache_l1=10752*KiB, cache_l2=40*MiB, register_size=27648*KiB,
    tdp=400,
    # shm 164KiB * sms?
    **AMPERE,
)

# TODO: figure out where Shared Memory + L1 Cache should go
# "The merger of shared memory and L1 resources enables an increase in shared memory capacity to 96 KB per Volta SM, compared to 64 KB in GP100."
# "The combined capacity of the L1 data cache and shared memory is 192 KB/SM in A100 versus 128 KB/SM in V100."
# H100: "256 KB of combined shared memory and L1 data cache, 1.33x larger than A100"

AD10x_register = lambda sms: sms * 64 * KiB * 4
add_gpu_info(
    "L4", "???", "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf#page=39",
    sms=58, cores_cuda=7424, cores_tensor=232,
    fp32_general=30.3e12, fp16=121e12,
    vram=24*GiB, membw=300*GiB,
    cache_l1=128*KiB*58, cache_l2=48*MiB, register_size=AD10x_register(58),
    tdp=72,
    # shm 164KiB * sms?
    **ADA,
)
add_gpu_info(
    "L40", "???", "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf#page=36",
    sms=142, cores_cuda=18176, cores_tensor=568,
    fp32_general=90.5e12, fp16=181e12,
    vram=48*GiB, membw=864*GiB,
    cache_l1=128*KiB*142, cache_l2=96*MiB, register_size=AD10x_register(142),
    tdp=300, **ADA,
)
add_gpu_info(
    "L40S", "???", "https://resources.nvidia.com/en-us-l40s/l40s-datasheet-28413",
    sms=142, cores_cuda=18176, cores_tensor=568,
    fp32_general=90.5e12, fp16=362.05e12,
    vram=48*GiB, membw=864*GiB,
    cache_l1=128*KiB*142, cache_l2=96*MiB, register_size=AD10x_register(142),
    tdp=350, **ADA,
)
add_gpu_info(
    "4000A", "???", "https://www.nvidia.com/content/dam/en-zz/Solutions/rtx-4000-sff/proviz-rtx-4000-sff-ada-datasheet-2616456-web.pdf",
    sms=48, cores_cuda=6144, cores_tensor=192,
    fp32_general=19.2e12, fp16=76.7e12,
    vram=20*GiB, membw=280*GiB,
    cache_l1=128*KiB*48, cache_l2=48*MiB, register_size=AD10x_register(48),
    tdp=130, **ADA,
)
add_gpu_info(
    "6000A", "???", "https://images.nvidia.com/aem-dam/en-zz/Solutions/technologies/NVIDIA-ADA-GPU-PROVIZ-Architecture-Whitepaper_1.1.pdf#page=28",
    sms=142, cores_cuda=18176, cores_tensor=568,
    fp32_general=91.1e12, fp16=364.2e12,
    vram=48*GiB, membw=960*GiB,
    cache_l1=128*KiB*142, cache_l2=96*MiB, register_size=AD10x_register(142),
    tdp=300, **ADA,
)
add_gpu_info(
    "4090", "???", "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-V2.02.pdf#page=30",
    sms=128, cores_cuda=16384, cores_tensor=512,
    fp32_general=82.6e12, fp16=330.3e12, crippled_fp32acc=True,
    vram=24*GiB, membw=1008*GiB,
    cache_l1=128*KiB*128, cache_l2=72*MiB, register_size=AD10x_register(128),
    tdp=450, **ADA,
)
add_gpu_info(
    "4080", "???", "https://images.nvidia.com/aem-dam/Solutions/Data-Center/l4/nvidia-ada-gpu-architecture-whitepaper-v2.1.pdf#page=13",
    sms=76, cores_cuda=9728, cores_tensor=304,
    fp32_general=48.7e12, fp16=194.9e12, crippled_fp32acc=True,
    vram=16*GiB, membw=734003*MiB,
    cache_l1=128*KiB*76, cache_l2=64*MiB, register_size=AD10x_register(76),
    tdp=320, **ADA,
)
add_gpu_info(
    "4070ti", "???", "https://www.techpowerup.com/gpu-specs/geforce-rtx-4070-ti.c3950",
    sms=60, cores_cuda=7680, cores_tensor=240,
    fp32_general=40.1e12, fp16=154.8e12, crippled_fp32acc=True,
    vram=12*GiB, membw=516301*MiB,
    cache_l1=128*KiB*60, cache_l2=48*MiB, register_size=AD10x_register(60),
    tdp=285, **ADA,
)
add_gpu_info(
    "H100-PCIe", "???", "https://www.advancedclustering.com/wp-content/uploads/2022/03/gtc22-whitepaper-hopper.pdf",
    sms=114, cores_cuda=14592, cores_tensor=456,
    fp32_general=66.9e12, fp16=756.5e12,
    vram=80*GiB, membw=2048*GiB,
    cache_l1=None, cache_l2=50*MiB, register_size=33792*KiB,
    tdp=350, **ADA,
)
add_gpu_info(
    "H100-SXM", "???", "https://resources.nvidia.com/en-us-tensor-core/nvidia-tensor-core-gpu-datasheet",
    sms=132, cores_cuda=16896, cores_tensor=528,
    fp32_general=66.9e12, fp16=989.4e12,
    vram=80*GiB, membw=3352*GiB,
    cache_l1=None, cache_l2=50*MiB, register_size=33792*KiB,
    tdp=700, **ADA,
)

# consider H100 NVL


import json
with open("some-gpus.json", 'w') as f:
    json.dump(TABLE, f)

# GPU_INFORMATION_DUMP = [
#     add_gpu_info("T4", "???", ..., 364.25e12),
#     add_gpu_info("6000A", ..., 364.25e12),

# ]
