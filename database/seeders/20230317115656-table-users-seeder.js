import { hash } from 'bcrypt';

module.exports = {
  async up(queryInterface, Sequelize) {
    var data = [
      {
        username: 'johndoe',
        password: 'Password',
      },
      {
        username: 'janedoe',
        password: 'Password',
      },
    ];

    for (let i = 0; i < data.length; i++) {
      const val = await hash(data[i].password, 10);
      data[i].password = val;
    }

    await queryInterface.bulkInsert('users', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
