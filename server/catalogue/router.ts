import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';

export const catalogueRouter = router({
  listProducts: publicProcedure.query(async () => {
    // Return catalogue items for Leopis Digital
    return [
      {
        id: "1",
        title: "Consumer Electronics Accessory",
        price: "LKR 4,500",
        category: "Consumer Electronics",
        image: "/assets/catalogue/1-dfEEPJxYMngd-ATfVDyJOo7ZgJHo5bT.webp"
      },
      {
        id: "2",
        title: "Modern Lifestyle Gadget",
        price: "LKR 7,900",
        category: "Lifestyle Products",
        image: "/assets/catalogue/11d5c9Uz19tctL-dhwBH1Fd_3a7hlhtll.webp"
      }
    ];
  }),
});
          
