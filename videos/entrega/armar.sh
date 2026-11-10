#!/bin/bash
# Arma el video de entrega: trailer, pitch con cama suave y cierre con el enlace.
# Uso: ./armar.sh "ruta/al/Kairos - The Pitch.mp4"
set -euo pipefail

PITCH="${1:?Falta la ruta del video del pitch}"
RAIZ="$(cd "$(dirname "$0")/../.." && pwd)"
TRAILER="$RAIZ/videos/trailer-montaje/renders/trailer-kairos-60s.mp4"
CIERRE="$RAIZ/videos/cierre-enlace/renders/cierre-enlace.mp4"
CAMA="$RAIZ/docs/video-pitch/musica/bgm-pitch-1-120s.mp3"
SALIDA="$RAIZ/videos/entrega/kairos-video-final.mp4"

# 107.5 es lo que dura el pitch y 113.5 el pitch más los 6 segundos del cierre.
# La cama va en 0.16 (unos -16 dB) bajo la voz y sube seis veces sobre el cierre.
ffmpeg -v error -y -i "$TRAILER" -i "$PITCH" -i "$CIERRE" -i "$CAMA" -filter_complex "
[0:v]fps=30,format=yuv420p,setsar=1[v0];
[1:v]fps=30,scale=1920:1080,format=yuv420p,setsar=1,trim=duration=107.5,setpts=PTS-STARTPTS,fade=t=in:st=0:d=0.3,fade=t=out:st=107.1:d=0.4[v1];
[2:v]fps=30,format=yuv420p,setsar=1,fade=t=in:st=0:d=0.3,fade=t=out:st=5.5:d=0.5[v2];
[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a0];
[1:a]loudnorm=I=-15:TP=-1.5:LRA=11,aformat=sample_rates=48000:channel_layouts=stereo,atrim=duration=107.5,apad=whole_dur=113.5[voz];
[3:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=duration=113.5,asetpts=PTS-STARTPTS,volume='0.16*(1+5*clip((t-106.8)/1.5,0,1))':eval=frame,afade=t=out:st=110.8:d=2.7[cama];
[voz][cama]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.89[a12];
[v1][v2]concat=n=2:v=1:a=0[v12];
[v0][a0][v12][a12]concat=n=2:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 18 -preset medium \
  -c:a aac -b:a 192k -movflags +faststart "$SALIDA"

echo "Listo: $SALIDA"
