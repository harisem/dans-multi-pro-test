import { compare, hash } from 'bcrypt';
import { Model, Sequelize } from 'sequelize';
import { generateToken } from '~/helpers';

export default function (sequelize) {
  class User extends Model {
    generateToken(expiresIn = '90d') {
      const data = { id: this.id, username: this.username };
      let token = generateToken(data, expiresIn);
      return token;
    }

    validatePassword(plainPassword) {
      return compare(plainPassword, this.password);
    }

    async hashPassword(password) {
      return await hash(password, 10);
    }

    static associate(models) {}
  }

  User.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: Sequelize.STRING,
      password: Sequelize.STRING,
    },
    {
      sequelize,
      tableName: 'users',
      modelName: 'User',
      underscored: true,
      timestamps: false,
    }
  );

  return User;
}
