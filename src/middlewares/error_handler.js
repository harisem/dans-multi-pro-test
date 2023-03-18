export default async function (err, req, res, next) {
  let issues = null;
  if (err.name == 'SequelizeConnectionRefusedError') {
    issues = {
      name: err.name,
      original: err.original,
    };
  }

  if (err.name == 'SequelizeUniqueConstraintError') {
    let value = err.errors[0].value;
    let field = Object.keys(err.fields)[0];
    err.message = `${field} with ${value} already added`;
    err.status = 400;
  }

  let error = {
    meta: {
      status: err.status || 500,
      message: err.message,
      issues: issues ? issues : err.issues,
    },
  };

  return res.status(err.status || 500).json(error);
}
