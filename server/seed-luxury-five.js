/**
 * Additive seed: inserts/updates 5 luxury properties WITHOUT deleting existing data.
 *
 * Usage:
 *   node seed-luxury-five.js
 *   npm run seed:luxury-five
 */
require('dotenv').config();

const mongoose = require('mongoose');
const Property = require('./models/Property');
const Admin = require('./models/Admin');
const { getDefaultFeatures } = require('./features');

if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI is required');
  process.exit(1);
}

const YEAR = new Date().getFullYear();

function features(type, patch = {}) {
  const base = getDefaultFeatures(type);
  return {
    common: { ...base.common, ...(patch.common || {}) },
    specific: { ...base.specific, ...(patch.specific || {}) },
    luxury: { ...base.luxury, ...(patch.luxury || {}) },
  };
}

function gallery(slug, count) {
  const images = Array.from({ length: count }, (_, i) => (
    `/assets/images/properties/astoria-property-${slug}-${String(i + 1).padStart(2, '0')}.webp`
  ));
  return { image: images[0], images };
}

/** Stable titles used as upsert keys — do not rename lightly. */
const LUXURY_FIVE = [
  {
    title: 'ویلای ساحلی مدرن آستوریا — کیش',
    type: 'ویلا',
    price: 78500000000,
    beds: 5,
    baths: 6,
    area: 620,
    age: YEAR - 2024,
    location: 'کیش، منطقه ساحلی مرجان، ایران',
    description:
      'ویلایی معاصر رو به آب‌های خلیج فارس با نمای تمام‌شیشه و ارتباط مستقیم فضای داخلی با تراس و استخر خصوصی. سالن اصلی دو ارتفاع، آشپزخانه یکپارچه، سوئیت مستر با رختکن و حمام اختصاصی، و پارکینگ زیرزمینی برای چهار خودرو. طراحی برای اقامت دائمی یا تعطیلات لوکس — نور طبیعی، حریم خصوصی و چشم‌انداز دریا در تمام ساعات روز.',
    listingType: 'آگهی ویژه',
    status: 'available',
    isExclusive: true,
    isFeatured: true,
    sortOrder: 920,
    views: 640,
    ...gallery('coastal', 8),
    features: features('ویلا', {
      common: {
        parking: 4,
        security: true,
        smart_home: true,
        cctv: true,
        heating: 'گرمایش از کف',
        cooling: 'داکت اسپلیت',
        flooring: 'سنگ',
        double_glazed: true,
      },
      specific: {
        yard_area: 980,
        pool_private: true,
        garden: true,
        bbq: true,
        generator: true,
        irrigation: true,
      },
      luxury: { pool: true, sauna: true, gym: true, home_cinema: true },
    }),
  },
  {
    title: 'اقامتگاه معاصر شهری — الهیه',
    type: 'ویلا',
    price: 64200000000,
    beds: 4,
    baths: 5,
    area: 480,
    age: YEAR - 2025,
    location: 'تهران، الهیه، خیابان فرشته، ایران',
    description:
      'خانه شهری با معماری مینیمال، نمای شیشه‌ای وسیع و روف‌تراس خصوصی. پلان باز طبقه همکف، استخر اینفینیتی در بام، گاراژ اختصاصی و جزئیات داخلی با مصالح خام و نورپردازی معماری. مناسب خریدارانی که سکونت شهری را با استاندارد اقامتگاه خصوصی می‌خواهند — فاصله کوتاه تا مراکز تجاری و سفارتخانه‌ها.',
    listingType: 'آگهی ارتقا یافته',
    status: 'available',
    isExclusive: true,
    isFeatured: false,
    sortOrder: 910,
    views: 512,
    ...gallery('urban', 8),
    features: features('ویلا', {
      common: {
        parking: 3,
        elevator: true,
        security: true,
        smart_home: true,
        flooring: 'پارکت',
        double_glazed: true,
      },
      specific: {
        yard_area: 220,
        pool_private: true,
        garden: true,
        bbq: true,
      },
      luxury: { pool: true, roof_garden: true, gym: true, luxury_lobby: true },
    }),
  },
  {
    title: 'عمارت مدیترانه‌ای — لواسان',
    type: 'ویلا',
    price: 112000000000,
    beds: 7,
    baths: 8,
    area: 900,
    age: YEAR - 2022,
    location: 'لواسان، جاده لوسان، کوی باغ‌ویلا، ایران',
    description:
      'عمارت گسترده با الهام از معماری مدیترانه‌ای و اروپایی — طاق‌ها، سنگ طبیعی، حیاط مرکزی و باغ بالغ. استخر روباز، فضای پذیرایی در فضای باز، سوئیت مهمان مجزا و چشم‌انداز کوهستانی. مناسب خانواده‌های بزرگ یا میزبانی خصوصی؛ ترکیب حریم کامل با امکان پذیرایی تشریفاتی در فضای سبز.',
    listingType: 'آگهی خصوصی',
    status: 'available',
    isExclusive: true,
    isFeatured: true,
    sortOrder: 930,
    views: 701,
    ...gallery('mediterranean', 8),
    features: features('ویلا', {
      common: {
        parking: 6,
        security: true,
        cctv: true,
        heating: 'پکیج',
        cooling: 'اسپلیت',
        flooring: 'سنگ',
      },
      specific: {
        yard_area: 4200,
        pool_private: true,
        garden: true,
        gazebo: true,
        bbq: true,
        generator: true,
        irrigation: true,
      },
      luxury: { pool: true, sauna: true, meeting_room: true, home_cinema: true },
    }),
  },
  {
    title: 'خانه شیشه‌ای معماری — زعفرانیه',
    type: 'ویلا',
    price: 69800000000,
    beds: 4,
    baths: 5,
    area: 510,
    age: YEAR - 2023,
    location: 'تهران، زعفرانیه، خیابان مقدس اردبیلی، ایران',
    description:
      'بیانیه معماری معاصر: بتن اکسپوز، شیشه و سنگ طبیعی در ترکیبی دقیق. پلان باز، سقف‌های بلند، نورپردازی دراماتیک و ارتباط پیوسته با باغ منظره‌سازی‌شده و استخر خصوصی. تراس وسیع برای نشیمن عصرگاهی؛ جزئیات مینیمال برای کسانی که معماری را بخشی از سبک زندگی می‌دانند.',
    listingType: 'آگهی ویژه',
    status: 'available',
    isExclusive: true,
    isFeatured: false,
    sortOrder: 905,
    views: 458,
    ...gallery('glasshouse', 8),
    features: features('ویلا', {
      common: {
        parking: 3,
        security: true,
        smart_home: true,
        flooring: 'سنگ',
        double_glazed: true,
        heating: 'گرمایش از کف',
        cooling: 'داکت اسپلیت',
      },
      specific: {
        yard_area: 740,
        pool_private: true,
        garden: true,
        irrigation: true,
      },
      luxury: { pool: true, gym: true, home_cinema: true },
    }),
  },
  {
    title: 'املاک ساحلی پرچمدار آستوریا — رامسر',
    type: 'ویلا',
    price: 156000000000,
    beds: 6,
    baths: 8,
    area: 1100,
    age: YEAR - 2021,
    location: 'رامسر، ساحل زیباکنار، ایران',
    description:
      'پرچمدار مجموعه آستوریا: املاک ساحلی با زیربنای بیش از ۱۱۰۰ متر، اسکله خصوصی، استخر، باغ وسیع و سوئیت مهمان مستقل. سالن‌های پذیرایی چندگانه، فضای سرگرمی در فضای باز و چشم‌انداز پانوراما به دریا. این اقامتگاه برای خریدارانی طراحی شده که حریم، مقیاس و تجربهٔ ساحلی را در بالاترین سطح می‌خواهند — نقطه اوج کاتالوگ خصوصی آستوریا.',
    listingType: 'آگهی خصوصی',
    status: 'available',
    isExclusive: true,
    isFeatured: true,
    sortOrder: 980,
    views: 980,
    ...gallery('waterfront', 10),
    features: features('ویلا', {
      common: {
        parking: 8,
        security: true,
        cctv: true,
        smart_home: true,
        heating: 'گرمایش از کف',
        cooling: 'چیلر',
        flooring: 'سنگ',
        double_glazed: true,
      },
      specific: {
        yard_area: 5600,
        pool_private: true,
        garden: true,
        bbq: true,
        gazebo: true,
        generator: true,
        irrigation: true,
      },
      luxury: {
        pool: true,
        sauna: true,
        gym: true,
        home_cinema: true,
        meeting_room: true,
        roof_garden: true,
      },
    }),
  },
];

async function seedLuxuryFive() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const admin = await Admin.findOne().sort({ createdAt: 1 });
    const createdBy = admin?._id || null;

    const before = await Property.countDocuments();
    const results = [];

    for (const property of LUXURY_FIVE) {
      const payload = {
        ...property,
        isActive: true,
        priceUnit: 'تومان',
        createdBy,
        updatedAt: new Date(),
      };

      const doc = await Property.findOneAndUpdate(
        { title: property.title },
        {
          $set: payload,
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      results.push({
        id: String(doc._id),
        title: doc.title,
        images: (doc.images || []).length,
        image: doc.image,
        price: doc.price,
        isFeatured: doc.isFeatured,
      });
      console.log(`✔ ${doc.title} (${doc._id}) — ${(doc.images || []).length} images`);
    }

    const after = await Property.countDocuments();
    console.log('\n🎉 Luxury five seed complete');
    console.log(`   Properties before: ${before}`);
    console.log(`   Properties after:  ${after}`);
    console.log(`   Delta:             ${after - before} (0 means all five already existed and were updated)`);
    console.log('\nIDs:');
    results.forEach((r) => console.log(`   ${r.id}  ${r.title}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ seed-luxury-five error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedLuxuryFive();
