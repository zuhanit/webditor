# Preprocess Graphics

1. Extract .anim files from Starcraft. You can use Ladik’s Casc Viewer, or anything can extract.
2. Distribute **HD** with **SD** files. Under the hood, before process HD .anim files, read entire file with prefix `.anim` at `path` argument indicates.
3. `python -m graphics.main --path {anim_folder} --sd --hd`

- `—path` : folder where anim files included
- `--sd`: process SD animation(e.g. mainSD.anim)
- `--hd`: process HD animation

## Input Folder Structure

Please follow this folder structure. If not, can’t find .anim file or unnecessary files will be generated.

```
anim/
├─ hd/
│  ├─ main_001.anim
│  ├─ main_002.anim
├─ sd/
│  ├─ mainSD.anim

```
