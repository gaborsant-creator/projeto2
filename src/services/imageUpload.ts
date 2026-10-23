import { supabase } from './supabase';

/**
 * Redimensiona e comprime uma imagem no navegador utilizando HTML5 Canvas.
 * Transforma imagens pesadas (4MB - 15MB de câmeras de celular) em imagens
 * super leves (~40KB - 80KB) mantendo ótima nitidez para exibição no cardápio.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 960,
  maxHeight = 960,
  quality = 0.84
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calcula novas dimensões mantendo proporção
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            maxHeight = height;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Não foi possível obter contexto 2D do Canvas.'));
          return;
        }

        // Desenha com interpolação suave
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Gera formato WebP (ou JPEG se WebP não for suportado)
        try {
          const webpData = canvas.toDataURL('image/webp', quality);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback abaixo
        }

        const jpegData = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegData);
      };

      img.onerror = () => reject(new Error('Falha ao carregar arquivo de imagem.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Converte DataURL Base64 para Blob para upload em storage
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'image/jpeg';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Processa o upload de uma foto de pizza:
 * 1. Otimiza/comprime a imagem no cliente
 * 2. Tenta fazer upload para Supabase Storage (buckets: 'cardapio' ou 'produtos')
 * 3. Se o Supabase Storage estiver sem bucket, utiliza o DataURL comprimido diretamente.
 */
export async function processAndUploadProductImage(
  file: File,
  productName = 'pizza'
): Promise<{ url: string; source: 'supabase' | 'base64'; sizeKb: number }> {
  // 1. Otimiza no cliente
  const compressedDataUrl = await compressImageFile(file, 960, 960, 0.84);
  const sizeKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);

  // 2. Tenta enviar para Supabase Storage se disponível
  try {
    const slug = productName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);

    const filename = `${slug || 'pizza'}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.webp`;
    const blob = dataUrlToBlob(compressedDataUrl);

    // Tenta primeiro bucket 'cardapio', depois 'produtos'
    for (const bucketName of ['cardapio', 'produtos', 'public']) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .upload(filename, blob, {
            contentType: 'image/webp',
            upsert: true,
          });

        if (!error && data?.path) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(data.path);

          if (publicUrlData?.publicUrl) {
            return {
              url: publicUrlData.publicUrl,
              source: 'supabase',
              sizeKb,
            };
          }
        }
      } catch {
        // tenta próximo bucket
      }
    }
  } catch (err) {
    console.info('Armazenando imagem otimizada em base64 diretamente:', err);
  }

  // 3. Retorna o DataURL otimizado caso não use Supabase Storage
  return {
    url: compressedDataUrl,
    source: 'base64',
    sizeKb,
  };
}

/**
 * Permite baixar/exportar a imagem atual da pizza para o computador ou celular
 */
export function downloadImage(imageUrl: string, filename = 'pizza-foto.jpg'): void {
  try {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (e) {
    console.error('Erro ao baixar imagem:', e);
  }
}
