export const AppConfig = {
  cloudinary: {
    name: 'dhigbculo',
    folder: 'portfolio',
  },
  endpoints: {
    galleryList: () => `https://res.cloudinary.com/${AppConfig.cloudinary.name}/image/list/${AppConfig.cloudinary.folder}.json`,
    galleryImg: (id: string) => `https://res.cloudinary.com/${AppConfig.cloudinary.name}/image/upload/q_auto,f_auto,w_900/${id}`,
    contactForm: 'https://formspree.io/f/xgorgbjo'
  },
  timeouts: {
    loaderMin: 4200,
    loaderFailsafe: 9000
  }
} as const;