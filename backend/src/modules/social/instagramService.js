const axios = require('axios');
const College = require('../../models/College');

// =========================
// GET IG CONFIG FROM DB
// =========================
async function getInstagramConfig(collegeId) {
  const college = await College.findOne({
    collegeId,
    isActive: true,
  });

  if (!college?.instagram?.igUserId || !college?.instagram?.accessToken) {
    throw new Error(`Instagram config missing for ${collegeId}`);
  }

  return {
    IG_USER_ID: college.instagram.igUserId,
    ACCESS_TOKEN: college.instagram.accessToken,
  };
}

// =========================
// SINGLE IMAGE POST
// =========================
async function postSingleImage(imageUrl, caption, collegeId) {
  const { IG_USER_ID, ACCESS_TOKEN } = await getInstagramConfig(collegeId);

  console.log('📸 SINGLE POST →', collegeId, IG_USER_ID);

  const container = await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
    null,
    {
      params: {
        image_url: imageUrl,
        caption,
        access_token: ACCESS_TOKEN,
      },
    },
  );

  const creationId = container.data.id;

  if (!creationId) {
    throw new Error('Single image container failed');
  }

  await new Promise((r) => setTimeout(r, 20000));

  await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: ACCESS_TOKEN,
      },
    },
  );

  console.log('✅ SINGLE POST DONE');
  return true;
}

// =========================
// CAROUSEL POST
// =========================
async function postCarousel(images, caption, collegeId) {
  const { IG_USER_ID, ACCESS_TOKEN } = await getInstagramConfig(collegeId);

  console.log('📸 CAROUSEL POST →', collegeId);

  const children = [];

  for (const url of images) {
    const res = await axios.post(
      `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
      null,
      {
        params: {
          image_url: url,
          is_carousel_item: true,
          access_token: ACCESS_TOKEN,
        },
      },
    );

    const id = res.data.id;

    if (!id) {
      throw new Error('Child media failed');
    }

    children.push(id);
  }

  await new Promise((r) => setTimeout(r, 15000));

  const carousel = await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media`,
    null,
    {
      params: {
        children: children.join(','),
        caption,
        media_type: 'CAROUSEL',
        access_token: ACCESS_TOKEN,
      },
    },
  );

  const creationId = carousel.data.id;

  if (!creationId) {
    throw new Error('Carousel create failed');
  }

  await new Promise((r) => setTimeout(r, 20000));

  await axios.post(
    `https://graph.facebook.com/v19.0/${IG_USER_ID}/media_publish`,
    null,
    {
      params: {
        creation_id: creationId,
        access_token: ACCESS_TOKEN,
      },
    },
  );

  console.log('🚀 CAROUSEL POSTED');
  return true;
}

// =========================
// MAIN FUNCTION
// =========================
async function postToInstagram(images, caption, collegeId) {
  if (!images || !images.length) {
    throw new Error('No images provided');
  }

  console.log('🔥 POSTING FOR COLLEGE:', collegeId);

  if (images.length === 1) {
    return await postSingleImage(images[0], caption, collegeId);
  }

  return await postCarousel(images, caption, collegeId);
}

module.exports = {
  postToInstagram,
};
