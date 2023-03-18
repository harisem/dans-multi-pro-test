import Sequelize, { Model } from 'sequelize';
import fs from 'fs';
import path from 'path';

import dbConfig from '~/config/database.js';

const models = {};
const sequelize = new Sequelize(dbConfig);
const excludeFile = ['index.js', 'base.model.js'];

fs.readdirSync(__dirname)
  .filter((file) => !excludeFile.includes(file) && file.slice(-3) === '.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file)).default(sequelize);
    models[model.name] = model;
  });

// Associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

exports.Models = sequelize.models;
exports.Db = sequelize;
exports.Sequelize = Sequelize;
exports.Op = Sequelize.Op;

export default sequelize;
