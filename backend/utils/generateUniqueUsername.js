
async function generateUniqueUsername(email,User) {
   
    const base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  
    let username = base;
    let counter  = 0;
  
   
    while (await User.exists({ username })) {
      counter++;
      username = `${base}${counter}`;
    }
  
    return username;
  }
  
  module.exports = { generateUniqueUsername };