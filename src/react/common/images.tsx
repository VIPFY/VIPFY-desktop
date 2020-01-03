export function getBgImageUser(image, size) {
  if (!image) {
    return null;
  }
  size = parseInt(size);

  const s = `fill/${encodeURI(image)}`;
  const size125 = Math.round(size * 1.25);
  const size150 = Math.round(size * 1.5);
  const size175 = Math.round(size * 1.75);

  return `-webkit-image-set(
      url("https://userimages.vipfy.store/${size}/${size}/${s}") 1x,
      url("https://userimages.vipfy.store/${size125}/${size125}/${s}") 1.25x,
      url("https://userimages.vipfy.store/${size150}/${size150}/${s}") 1.5x,
      url("https://userimages.vipfy.store/${size175}/${size175}/${s}") 1.75x,
      url("https://userimages.vipfy.store/${size * 2}/${size * 2}/${s}") 2x,
      url("https://userimages.vipfy.store/${size * 4}/${size * 4}/${s}") 4x
    )`;
}

export function getBgImageTeam(image, size) {
  return getBgImageUser(image, size);
}

export function getSourceSetUser(image, size) {
  if (!image) {
    return null;
  }
  size = parseInt(size);

  const s = `fill/${encodeURI(image)}`;
  const size125 = Math.round(size * 1.25);
  const size150 = Math.round(size * 1.5);
  const size175 = Math.round(size * 1.75);

  return `https://userimages.vipfy.store/${size}/${size}/${s} 1x,
      https://userimages.vipfy.store/${size125}/${size125}/${s} 1.25x,
      https://userimages.vipfy.store/${size150}/${size150}/${s} 1.5x,
      https://userimages.vipfy.store/${size175}/${size175}/${s} 1.75x,
      https://userimages.vipfy.store/${size * 2}/${size * 2}/${s} 2x,
      https://userimages.vipfy.store/${size * 4}/${size * 4}/${s} 4x`;
}

export function getSourceSetTeam(image, size) {
  return getSourceSetUser(image, size);
}

export function getBgImageApp(image, size) {
  if (!image) {
    return null;
  }
  size = parseInt(size);

  const s = `fit/${encodeURI(image)}`;
  const size125 = Math.round(size * 1.25);
  const size150 = Math.round(size * 1.5);
  const size175 = Math.round(size * 1.75);

  return `-webkit-image-set(
      url("https://appimages.vipfy.store/${size}/${size}/${s}") 1x,
      url("https://appimages.vipfy.store/${size125}/${size125}/${s}") 1.25x,
      url("https://appimages.vipfy.store/${size150}/${size150}/${s}") 1.5x,
      url("https://appimages.vipfy.store/${size175}/${size175}/${s}") 1.75x,
      url("https://appimages.vipfy.store/${size * 2}/${size * 2}/${s}") 2x,
      url("https://appimages.vipfy.store/${size * 4}/${size * 4}/${s}") 4x
    )`;
}

export function getSourceSetApp(image, size) {
  if (!image) {
    return null;
  }
  size = parseInt(size);

  const s = `fit/${encodeURI(image)}`;
  const size125 = Math.round(size * 1.25);
  const size150 = Math.round(size * 1.5);
  const size175 = Math.round(size * 1.75);

  return `https://appimages.vipfy.store/${size}/${size}/${s} 1x,
      https://appimages.vipfy.store/${size125}/${size125}/${s} 1.25x,
      https://appimages.vipfy.store/${size150}/${size150}/${s} 1.5x,
      https://appimages.vipfy.store/${size175}/${size175}/${s} 1.75x,
      https://appimages.vipfy.store/${size * 2}/${size * 2}/${s} 2x,
      https://appimages.vipfy.store/${size * 4}/${size * 4}/${s} 4x`;
}

export function getImageUrlTeam(image, size) {
  if (!image) {
    return null;
  }
  size = parseInt(size);

  return `https://userimages.vipfy.store/${size}/${size}/fill/${encodeURI(image)}`;
}

export function getImageUrlUser(image, size) {
  return getImageUrlTeam(image, size);
}

export function getImageUrlApp(image, size) {
  if (!image) {
    return null;
  }
  size = parseInt(size);

  return `https://appimages.vipfy.store/${size}/${size}/fit/${encodeURI(image)}`;
}

/**
 * Resizes an image so that we minimize traffic send to server
 *
 * @param {File} file
 */
export const resizeImage = async file => {
  try {
    let img = document.createElement("img");
    img.src = await new Promise<any>(resolve => {
      let reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
    await new Promise(resolve => (img.onload = resolve));

    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");
    ctx!.drawImage(img, 0, 0);

    const MAX_WIDTH = 90;
    const MAX_HEIGHT = 90;
    let width = img.naturalWidth;
    let height = img.naturalHeight;

    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext("2d");
    ctx!.drawImage(img, 0, 0, width, height);

    let result = await new Promise<Blob>(resolve => {
      canvas.toBlob(resolve, "image/jpeg", 0.95);
    });

    return result;
  } catch (error) {
    throw new Error(error);
  }
};
