const bcrypt = require('bcryptjs');

const password = 'LetMeIn!'; // كلمة المرور التي تريد تشفيرها
const salt = bcrypt.genSaltSync(10); // توليد الملح
const hashedPassword = bcrypt.hashSync(password, salt); // تشفير كلمة المرور

console.log(hashedPassword);  // سيطبع كلمة المرور المشفرة في وحدة التحكم
