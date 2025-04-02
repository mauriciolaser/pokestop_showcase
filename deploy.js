const { DEPLOY_FTP_USER, DEPLOY_FTP_PASSWORD, DEPLOY_FTP_HOST, DEPLOY_FTP_PORT, DEPLOY_FTP_PATH } = require('./config');
const FtpDeploy = require('ftp-deploy');
const ftpDeploy = new FtpDeploy();

const config = {
  user: DEPLOY_FTP_USER,
  password: DEPLOY_FTP_PASSWORD,
  host: DEPLOY_FTP_HOST,
  port: Number(DEPLOY_FTP_PORT), // Aseguramos que sea numérico
  localRoot: __dirname + "/dist", // Aquí se asume que tu build se genera en /dist
  remoteRoot: DEPLOY_FTP_PATH,     // Ruta remota definida en el archivo de configuración
  include: ["*", "**/*", ".*", "**/.*"], // Incluye todos los archivos, incluidos los ocultos
  deleteRemote: true,              // Borra en remoto lo que no exista localmente
  forcePasv: true                  // Fuerza el modo PASV
};

ftpDeploy.deploy(config)
  .then(() => console.log("¡Deploy finalizado!"))
  .catch(err => console.error("Error en el deploy:", err));
