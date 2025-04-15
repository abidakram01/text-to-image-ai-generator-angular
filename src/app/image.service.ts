import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private API_KEY = environment.API_KEY;

  async generateImage(modelUrl: string, prompt: string, width: number, height: number): Promise<Blob> {
    const res = await fetch(modelUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { width, height },
        options: { wait_for_model: true, use_cache: false }
      })
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.blob();
  }

  getImageDimensions(aspectRatio: string, baseSize = 512): { width: number; height: number } {
    const [w, h] = aspectRatio.split('/').map(Number);
    const scale = baseSize / Math.sqrt(w * h);
    let width = Math.floor((w * scale) / 16) * 16;
    let height = Math.floor((h * scale) / 16) * 16;
    return { width, height };
  }
}
