import bcrypt from "bcrypt";

//matlab we create the password jo ki database mae alag naam se save ho or koi na phad ske.
export const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
      bcrypt.genSalt(12, (err, salt) => {
        //salt means the lenght of the hashed value.
        if (err) {
          reject(err);
        }
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            reject(err);
          }
          resolve(hash);
        });
      });
    });
  };
  
  export const comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed); //give true or false
  };