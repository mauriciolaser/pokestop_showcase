require('dotenv').config({ path: '.env.production' });
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
  user: process.env.DEPLOY_FTP_USER,
  password: process.env.DEPLOY_FTP_PASSWORD,
  host: process.env.DEPLOY_FTP_HOST,
  port: Number(process.env.DEPLOY_FTP_PORT),  // Aseguramos que sea numérico
  localRoot: __dirname + "/dist",             // Aquí se asume que tu build se genera en /dist
  remoteRoot: process.env.DEPLOY_FTP_PATH,      // Ruta remota definida en el .env.production
  include: ["*", "**/*", ".*", "**/.*"],       // Incluye todos los archivos, incluidos los ocultos
  deleteRemote: true,                          // Borra en remoto lo que no exista localmente
  forcePasv: true                              // Fuerza el modo PASV
};

ftpDeploy.deploy(config)
  .then(() => console.log("¡Deploy finalizado!"))
  .catch(err => console.error("Error en el deploy:", err));
