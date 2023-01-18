import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const users = 
[
  {
    // id: 1,
    email: 'itp21101@hua.gr',
    username: 'itp21101',
    first_name: 'ΑΠΟΣΤΟΛΟΣ',
    last_name: 'ΑΓΓΕΛΗΣ',
    name_el: null,
    name_en: 'Apostolos',
    surname_el: 'Αγγέλης',
    surname_en: 'Angelis',
    father_name_el: 'Δημήτριος',
    father_name_en: 'Dimitrios',
    department: 'Πληροφορικής και Τηλεματικής',
    title: 'Μεταπτυχιακός Φοιτητής',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-08T14:01:17.918Z',
    date_joined: '2022-11-19T12:20:23.210Z'
  },
  {
    // id: 2,
    email: 'itp21100@hua.gr',
    username: 'itp21100',
    first_name: 'ΒΑΣΙΛΗΣ',
    last_name: 'ΗΛΙΟΥ',
    name_el: 'Βασίλης',
    name_en: 'Vassilis',
    surname_el: 'Ηλιού',
    surname_en: 'Iliou',
    father_name_el: 'Ευάγγελος',
    father_name_en: 'Evangelos',
    department: 'Πληροφορικής και Τηλεματικής',
    title: 'Μεταπτυχιακός Φοιτητής',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-08T12:23:33.879Z',
    date_joined: '2022-11-19T12:20:35.849Z'
  },
  {
    // id: 4,
    email: 'admin@hua.gr',
    username: 'admin',
    first_name: 'Διαχειριστής',
    last_name: 'συστήματος',
    name_el: null,
    name_en: null,
    surname_el: null,
    surname_en: null,
    father_name_el: null,
    father_name_en: null,
    department: 'Πληροφορικής και Τηλεματικής',
    title: 'Προσωπικό διαχείρισης',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-03T16:35:36.775Z',
    date_joined: '2022-11-29T19:21:01.346Z'
  },
  {
    // id: 5,
    email: 'tsadimas@hua.gr',
    username: 'tsadimas',
    first_name: 'ΑΝΑΡΓΥΡΟΣ',
    last_name: 'ΤΣΑΔΗΜΑΣ',
    name_el: null,
    name_en: null,
    surname_el: null,
    surname_en: null,
    father_name_el: null,
    father_name_en: null,
    department: 'Πληροφορικής και Τηλεματικής',
    title: 'Διδακτικό Προσωπικό',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: true,
    last_login: '2022-12-01T18:20:39.299Z',
    date_joined: '2022-12-01T18:06:05.283Z'
  },
  {
    // id: 6,
    email: 'ifigenia@hua.gr',
    username: 'ifigenia',
    first_name: 'ΙΦΙΓΕΝΕΙΑ',
    last_name: 'ΒΑΡΔΑΚΩΣΤΑ',
    name_el: null,
    name_en: null,
    surname_el: null,
    surname_en: null,
    father_name_el: null,
    father_name_en: null,
    department: 'Βιβλιοθήκη και Κέντρο Πληροφόρησης',
    title: 'Bιβλιοθηκάριος',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-08T17:19:39.901Z',
    date_joined: '2022-12-20T18:48:36.879Z'
  },
  {
    // id: 7,
    email: 'mitsi@hua.gr',
    username: 'mitsi',
    first_name: 'ΜΗΤΣΗ',
    last_name: 'ΛΟΡΕΤΑ',
    name_el: null,
    name_en: null,
    surname_el: null,
    surname_en: null,
    father_name_el: null,
    father_name_en: null,
    department: 'Γραμματεία Τμήματος Πληροφορικής και Τηλεματικής',
    title: 'Διοικητική Υπάλληλος',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-03T17:51:58.941Z',
    date_joined: '2022-12-24T17:37:58.608Z'
  },
  {
    // id: 8,
    email: 'daneli@hua.gr',
    username: 'daneli',
    first_name: 'ΦΩΤΕΙΝΗ',
    last_name: 'ΔΑΝΕΛΗ',
    name_el: null,
    name_en: null,
    surname_el: null,
    surname_en: null,
    father_name_el: null,
    father_name_en: null,
    department: 'Γραμματεία Τμήματος Πληροφορικής και Τηλεματικής',
    title: 'Διοικητική Υπάλληλος',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-04T11:31:33.421Z',
    date_joined: '2022-12-27T11:25:46.981Z'
  },
  {
    // id: 9,
    email: 'itp22044@hua.gr',
    username: 'itp22044',
    first_name: 'ΔΗΜΗΤΡΙΟΣ',
    last_name: 'ΠΑΠΑΓΕΩΡΓΙΟΥ',
    name_el: 'Δημήτριος',
    name_en: 'Dimitrios',
    surname_el: 'Παπαγεωργίου',
    surname_en: 'Papageorgiou',
    father_name_el: 'Αθανάσιος',
    father_name_en: null,
    department: 'Πληροφορικής και Τηλεματικής',
    title: 'Προπτυχιακός Φοιτητής',
    title_ldap: null,
    is_staff: false,
    is_active: true,
    is_superuser: false,
    last_login: '2023-01-08T17:01:23.832Z',
    date_joined: '2022-12-31T13:57:01.158Z'
  }
]




async function main() {

  users.forEach(
    async x => {
    const user = await prisma.user.create({
      data: x
    })
    console.log(user.last_name)
  })

}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
