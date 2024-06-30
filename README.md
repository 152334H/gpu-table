# Instructions for setting up

```
python3 gpu_consts.py # Generates some-gpus.json
python3 build_data.py # Takes some-gpus.json and generates the data inside src/assets/gpu_data.json
npm i
npm run dev
```

## For deploying:

[CI](https://github.com/152334H/gpu-table/blob/main/.github/workflows/publish.yaml) autodeploys to [github page](https://152334h.github.io/gpu-table/)

you can build locally though:
```
npm run build
```
