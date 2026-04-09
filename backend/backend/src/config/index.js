import dotenv from 'dotenv';
dotenv.config();

export const getGlobalConfig = () => ({
  geminiApiKey: process.env.GEMINI_API_KEY,
  imgbbKey: process.env.IMGBB_KEY,
  safeLimit: Number(process.env.SAFE_LIMIT || 665),
});

export const getCollegeConfig = (college) => ({
  accessToken: college?.instagram?.accessToken || '',
  telegramBotToken: college?.telegram?.botToken || '',
  cmdBotToken: college?.commandBot?.botToken || '',

  pageName: college?.instagram?.pageName || '',

  templateId: college?.posting?.templateId || '',
  igUserId: college?.instagram?.igUserId || '',

  telegramChatId: college?.telegram?.chatId || '',
  cmdChatId: college?.commandBot?.chatId || '',

  rootFolderId: college?.drive?.rootFolderId || '',
  queueFolderId: college?.drive?.queueFolderId || '',
  postedFolderId: college?.drive?.postedFolderId || '',
  rejectedFolderId: college?.drive?.rejectedFolderId || '',
  editArchiveFolderId: college?.drive?.editArchiveFolderId || '',
  smallConfessionFolder: college?.drive?.smallConfessionFolder || '',

  ...getGlobalConfig(),
});
