require('dotenv').config();

const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Property = require('./models/Property');
const Customer = require('./models/Customer');
const Agent = require('./models/Agent');
const Settings = require('./models/Settings');
const { getDefaultFeatures } = require('./features');

const DEMO_SEED = process.env.DEMO_SEED === 'true' || process.argv.includes('--demo');

if (!DEMO_SEED) {
  console.error('❌ Demo seed aborted: set DEMO_SEED=true or pass --demo to run.');
  console.error('   Example: npm run seed');
  process.exit(1);
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/astoria_elite';

const DEMO_ADMIN = {
  username: 'admin@astoria.local',
  password: 'AstoriaDemo2026!',
  name: 'مدیر آستوریا',
  role: 'owner',
};

const UPLOAD_IMAGES = [
  '/uploads/1785353493680-196846943.jpg',
  '/uploads/1785354838495-823428764.jpg',
  '/uploads/1785417608318-745866872.jpg',
  '/uploads/1785418626782-243569580.jpg',
  '/uploads/1785426291484-895192775.jpg',
  '/uploads/1785426345823-409447736.jpg',
  '/uploads/1785426362571-307861419.jpg',
];

function img(index, extra = []) {
  const primary = UPLOAD_IMAGES[index % UPLOAD_IMAGES.length];
  const secondary = UPLOAD_IMAGES[(index + 1) % UPLOAD_IMAGES.length];
  const images = [primary, secondary, ...extra].filter((v, i, a) => a.indexOf(v) === i);
  return { image: primary, images };
}

function features(type, patch = {}) {
  const base = getDefaultFeatures(type);
  return {
    common: { ...base.common, ...(patch.common || {}) },
    specific: { ...base.specific, ...(patch.specific || {}) },
    luxury: { ...base.luxury, ...(patch.luxury || {}) },
  };
}

const DEMO_PROPERTIES = [
  {
    title: 'ویلای مدرن آفتاب لواسان',
    type: 'ویلا',
    price: 45000000000,
    beds: 5,
    baths: 4,
    area: 520,
    age: 2,
    location: 'لواسان، جاده لوسان، کوی آرامش',
    description: 'ویلایی معاصر با معماری مینیمال و نورگیری عالی در لواسان. حیاط اختصاصی، استخر روباز، سونا و فضای سبز پیرامونی، این ملک را برای خانواده‌هایی که به آرامش و حریم خصوصی اهمیت می‌دهند ایده‌آل کرده است.',
    listingType: 'آگهی ویژه',
    isExclusive: true,
    views: 428,
    ...img(0),
    features: features('ویلا', {
      common: { parking: 3, security: true, smart_home: true, heating: 'گرمایش از کف', cooling: 'داکت اسپلیت', flooring: 'سنگ' },
      specific: { yard_area: 800, pool_private: true, garden: true, bbq: true, generator: true },
      luxury: { pool: true, sauna: true, gym: true, home_cinema: true },
    }),
  },
  {
    title: 'پنت‌هاوس ۳۶۰ درجه نیاوران',
    type: 'پنت‌هاوس',
    price: 38500000000,
    beds: 4,
    baths: 3,
    area: 380,
    age: 1,
    location: 'تهران، نیاوران، خیابان باهنر',
    description: 'پنت‌هاوسی تمام‌نما با ویوی پانورامای شهر و البرز. طراحی داخلی با مصالح لوکس، روف‌گاردن اختصاصی و آسانسور خصوصی. مناسب برای خریدارانی که به دنبال تجربه‌ای متفاوت از زندگی شهری لوکس هستند.',
    listingType: 'آگهی ارتقا یافته',
    isExclusive: true,
    views: 512,
    ...img(1),
    features: features('پنت‌هاوس', {
      common: { parking: 2, elevator: true, security: true, smart_home: true, flooring: 'پارکت' },
      specific: { private_elevator: true, panoramic_view: true, high_ceiling: true, luxury_materials: true, roof_garden: true },
      luxury: { roof_garden: true, home_cinema: true, gym: true, luxury_lobby: true },
    }),
  },
  {
    title: 'آپارتمان لوکس فرمانیه',
    type: 'آپارتمان',
    price: 22800000000,
    beds: 3,
    baths: 2,
    area: 185,
    age: 3,
    location: 'تهران، فرمانیه، کوچه گلستان',
    description: 'آپارتمانی شیک و آماده سکونت در یکی از محبوب‌ترین محله‌های شمال تهران. آشپزخانه اپن، خواب مستر مجزا و نورگیری دوطرفه. دسترسی سریع به بزرگراه‌ها و مراکز خرید لوکس.',
    listingType: 'آگهی ویژه',
    isExclusive: false,
    views: 296,
    ...img(2),
    features: features('آپارتمان', {
      common: { parking: 1, elevator: true, security: true, cabinet: 'هایگلاس', flooring: 'لمینت' },
      specific: { floor: 6, total_floors: 8, balcony: true, open_kitchen: true, master_bedroom: true, lobby: true },
      luxury: { luxury_lobby: true },
    }),
  },
  {
    title: 'ویلای ساحلی مهتاب رامسر',
    type: 'ویلا',
    price: 52000000000,
    beds: 4,
    baths: 3,
    area: 410,
    age: 4,
    location: 'رامسر، ساحل زیباکنار',
    description: 'ویلایی ساحلی با دسترسی نزدیک به دریا و فضایی آرام برای اقامت‌های آخر هفته. تراس وسیع، حیاط سرسبز و امکانات تفریحی کامل. گزینه‌ای عالی برای علاقه‌مندان به سبک زندگی ساحلی لوکس.',
    listingType: 'آگهی خصوصی',
    isExclusive: true,
    views: 367,
    ...img(3),
    features: features('ویلا', {
      common: { parking: 2, security: true, cooling: 'اسپلیت', flooring: 'سرامیک' },
      specific: { yard_area: 600, pool_private: true, garden: true, gazebo: true },
      luxury: { pool: true, sauna: true },
    }),
  },
  {
    title: 'آپارتمان الهیه با ویو شهر',
    type: 'آپارتمان',
    price: 19200000000,
    beds: 2,
    baths: 2,
    area: 142,
    age: 5,
    location: 'تهران، الهیه، خیابان فرشته',
    description: 'آپارتمانی دنج با چشم‌انداز زیبای شهر در قلب الهیه. مناسب برای زوج‌های جوان یا سرمایه‌گذارانی که به دنبال ملک با پتانسیل اجاره لوکس هستند.',
    listingType: 'آگهی ویژه',
    isExclusive: false,
    views: 184,
    ...img(4),
    features: features('آپارتمان', {
      common: { parking: 1, elevator: true, security: true, double_glazed: true },
      specific: { floor: 9, total_floors: 12, balcony: true, master_bedroom: true, closet: true },
      luxury: { gym: true },
    }),
  },
  {
    title: 'باغ‌ویلای سرسبز کردان',
    type: 'باغ',
    price: 27500000000,
    beds: 3,
    baths: 2,
    area: 320,
    age: 6,
    location: 'کردان، جاده چالوس، ورودی شهرک ویلایی',
    description: 'باغ‌ویلایی با درختان میوه بالغ و فضای سبز گسترده. بنا با معماری سنتی-مدرن، استخر و محوطه‌سازی حرفه‌ای. ایده‌آل برای دورهمی‌های خانوادگی و استراحت آخر هفته.',
    listingType: 'آگهی ویژه',
    isExclusive: false,
    views: 241,
    ...img(5),
    features: features('باغ', {
      common: { parking: 2, security: true },
      specific: { building_area: 320, fruit_trees: true, tree_age: 15, swimming_pool: true, road_access: true, landscaping: true },
      luxury: { pool: true, meeting_room: true },
    }),
  },
  {
    title: 'زمین سرمایه‌گذاری زعفرانیه',
    type: 'زمین',
    price: 98000000000,
    beds: 0,
    baths: 0,
    area: 1200,
    age: 0,
    location: 'تهران، زعفرانیه، خیابان اصلی',
    description: 'زمینی با موقعیت ممتاز در زعفرانیه، مناسب برای پروژه‌های لوکس مسکونی یا سرمایه‌گذاری بلندمدت. سند تک‌برگ، دسترسی عالی و پتانسیل ساخت بالا.',
    listingType: 'آگهی ارتقا یافته',
    isExclusive: true,
    views: 156,
    ...img(6),
    features: features('زمین', {
      common: { security: true },
      specific: { usage_type: 'مسکونی', deed_type: 'تک‌برگ', width: 30, length: 40, on_street: true, electricity: true, water: true, gas: true, build_permit: true },
      luxury: {},
    }),
  },
  {
    title: 'دفتر اداری VIP آجودانیه',
    type: 'دفتر کار',
    price: 11800000000,
    beds: 0,
    baths: 1,
    area: 210,
    age: 2,
    location: 'تهران، آجودانیه، برج اداری نور',
    description: 'دفتر اداری لوکس با لابی مجزا، اتاق کنفرانس و زیرساخت شبکه کامل. مناسب برای شرکت‌های حقوقی، مشاوره مدیریت و برندهای بین‌المللی.',
    listingType: 'آگهی ویژه',
    isExclusive: false,
    views: 132,
    ...img(0, ['/uploads/1785418626782-243569580.jpg']),
    features: features('دفتر کار', {
      common: { parking: 2, elevator: true, security: true, cctv: true, cooling: 'چیلر' },
      specific: { office_usage: true, reception: true, conference_room: true, network_infra: true, access_control: true },
      luxury: { meeting_room: true, luxury_lobby: true },
    }),
  },
  {
    title: 'ویلای باغی نیلگون کیش',
    type: 'ویلا',
    price: 69000000000,
    beds: 5,
    baths: 4,
    area: 480,
    age: 1,
    location: 'کیش، منطقه ساحلی مرجان',
    description: 'ویلایی مدرن در جزیره کیش با دسترسی آسان به مراکز تفریحی و ساحل. طراحی باز، نور طبیعی فراوان و امکانات رفاهی کامل برای اقامت لوکس در تمام فصول.',
    listingType: 'آگهی ویژه',
    isExclusive: true,
    views: 389,
    ...img(1, ['/uploads/1785426291484-895192775.jpg']),
    features: features('ویلا', {
      common: { parking: 3, security: true, smart_home: true, flooring: 'سنگ' },
      specific: { yard_area: 700, pool_private: true, garden: true, irrigation: true },
      luxury: { pool: true, gym: true, sauna: true, home_cinema: true },
    }),
  },
  {
    title: 'آپارتمان لوکس ولنجک',
    type: 'آپارتمان',
    price: 26400000000,
    beds: 3,
    baths: 2,
    area: 198,
    age: 2,
    location: 'تهران، ولنجک، خیابان دانشجو',
    description: 'آپارتمانی نوساز با متریال باکیفیت در ولنجک. فضای داخلی گرم و مدرن، دسترسی عالی به پارک‌ها و رستوران‌های لوکس منطقه. گزینه‌ای مطمئن برای سکونت یا سرمایه‌گذاری.',
    listingType: 'آگهی ویژه',
    isExclusive: false,
    views: 278,
    ...img(2, ['/uploads/1785426345823-409447736.jpg']),
    features: features('آپارتمان', {
      common: { parking: 2, elevator: true, security: true, smart_home: true, cabinet: 'چوب طبیعی' },
      specific: { floor: 4, total_floors: 7, balcony: true, open_kitchen: true, master_bedroom: true, false_ceiling: true },
      luxury: { gym: true, luxury_lobby: true },
    }),
  },
];

const DEMO_CUSTOMERS = [
  {
    name: 'سارا محمدی',
    email: 'sara.mohammadi@example.com',
    phone: '09121234567',
    message: 'درخواست بازدید از ویلای لواسان در روزهای پنج‌شنبه یا جمعه.',
    source: 'فرم سایت',
    isRead: false,
    notes: '',
  },
  {
    name: 'امیرحسین رضایی',
    email: '09129876543@request.astoria',
    phone: '09129876543',
    message: 'درخواست برای: پنت‌هاوس ۳۶۰ درجه نیاوران\nعلاقه‌مند به اطلاعات بیشتر درباره شرایط پرداخت.',
    source: 'فرم سایت',
    isRead: false,
    notes: '',
  },
  {
    name: 'نرگس کریمی',
    email: 'narges.karimi@example.com',
    phone: '02122334455',
    message: 'آیا امکان بازدید حضوری از آپارتمان فرمانیه وجود دارد؟',
    source: 'تماس تلفنی',
    isRead: true,
    notes: 'تماس گرفته شد — بازدید برای سه‌شنبه هماهنگ شود.',
  },
  {
    name: 'مهدی عباسی',
    email: '09131112233@tour.astoria',
    phone: '09131112233',
    message: 'درخواست بازدید برای تاریخ 2026-09-10 - ملک: ویلای ساحلی مهتاب رامسر',
    source: 'فرم سایت',
    isRead: true,
    notes: '',
  },
  {
    name: 'لیلا حیدری',
    email: 'leila.heydari@example.com',
    phone: '09351234567',
    message: 'پیگیری قیمت نهایی زمین زعفرانیه و شرایط انتقال سند.',
    source: 'معرف',
    isRead: false,
    notes: '',
  },
  {
    name: 'کاوه نوری',
    email: 'kaveh.nouri@example.com',
    phone: '02144556677',
    message: 'علاقه‌مند به خرید دفتر اداری در آجودانیه برای شرکت مشاوره.',
    source: 'بازدید حضوری',
    isRead: true,
    notes: 'پیشنهاد قیمت ارسال شد.',
  },
  {
    name: 'مریم صادقی',
    email: '09145556677@quick.astoria',
    phone: '09145556677',
    message: 'در مورد این ملک اطلاعات بیشتری می‌خواهم.\n\n(در مورد ملک: آپارتمان لوکس ولنجک)',
    source: 'فرم سایت',
    isRead: false,
    notes: '',
  },
];

const DEMO_AGENTS = [
  {
    name: 'امیررضا محمدی',
    title: 'مشاور ارشد املاک لوکس',
    bio: 'بیش از ۱۲ سال تجربه در معاملات املاک لوکس شمال تهران و لواسان. تخصص در ویلا و پنت‌هاوس.',
    phone: '09121234567',
    email: 'amir.mohammadi@astoriaelite.com',
    photo: '/uploads/1785418626782-243569580.jpg',
    isActive: true,
  },
  {
    name: 'سارا کریمی',
    title: 'مشاور املاک تجاری و مسکونی',
    bio: 'متخصص آپارتمان‌های لوکس و دفاتر اداری در مناطق الهیه، فرمانیه و آجودانیه.',
    phone: '09129876543',
    email: 'sara.karimi@astoriaelite.com',
    photo: '/uploads/1785426345823-409447736.jpg',
    isActive: true,
  },
  {
    name: 'کاوه نوری',
    title: 'مشاور سرمایه‌گذاری املاک',
    bio: 'مشاوره تخصصی برای خریداران سرمایه‌گذار در زمین، باغ‌ویلا و پروژه‌های لوکس ساحلی.',
    phone: '02144556677',
    email: 'kaveh.nouri@astoriaelite.com',
    photo: '/uploads/1785417608318-745866872.jpg',
    isActive: true,
  },
];

async function seedDemo() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    await Promise.all([
      Admin.deleteMany({}),
      Property.deleteMany({}),
      Customer.deleteMany({}),
      Agent.deleteMany({}),
      Settings.deleteMany({}),
    ]);
    console.log('🧹 Demo collections cleared');

    const admin = await Admin.create({
      username: DEMO_ADMIN.username,
      password: DEMO_ADMIN.password,
      name: DEMO_ADMIN.name,
      role: DEMO_ADMIN.role,
    });

    const loginWorks = await admin.comparePassword(DEMO_ADMIN.password);
    if (!loginWorks) {
      throw new Error('Admin password verification failed after seeding');
    }

    const properties = await Property.insertMany(
      DEMO_PROPERTIES.map((property) => ({
        ...property,
        isActive: true,
        createdBy: admin._id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
      }))
    );

    const customers = await Customer.insertMany(
      DEMO_CUSTOMERS.map((customer, index) => ({
        ...customer,
        createdAt: new Date(Date.now() - index * 3600000 * 6),
      }))
    );

    const agents = await Agent.insertMany(DEMO_AGENTS);

    await Settings.create({
      key: 'heroBackground',
      value: UPLOAD_IMAGES[4],
    });

    console.log('\n🎉 Demo seed completed successfully\n');
    console.log(`   Properties: ${properties.length}`);
    console.log(`   Customers:  ${customers.length}`);
    console.log(`   Agents:     ${agents.length}`);
    console.log(`   Admin:      ${DEMO_ADMIN.username}`);
    console.log(`   Password:   ${DEMO_ADMIN.password}`);
    console.log(`   Hero image: ${UPLOAD_IMAGES[4]}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

seedDemo();
