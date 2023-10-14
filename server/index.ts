import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import cors from 'cors';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { connectDB } from './config/mongoose';
import dotenv from 'dotenv';

const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

const s3 = new S3Client({
  region: process.env.region as string,
  credentials: {
    accessKeyId: process.env.accessKeyId as string,
    secretAccessKey: process.env.secretAccessKey as string,
  },
  endpoint: process.env.endpoint as string,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.name as string,
    acl: 'public-read',
    key: function (request: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) {
      console.log(file);
      cb(null, file.originalname);
    },
  }),
}).array('upload', 1);

app.get('/', function (request: Request, response: Response) {
  response.send('Hello World!');
});

app.post('/upload', function (request: Request, response: Response, next: NextFunction) {
  upload(request, response, function (error: any) {
    if (error) {
      console.log(error);
      return response.status(500).json({ success: false, message: "Erreur lors de l'upload" });
    }
    console.log('File uploaded successfully.');
    response.status(200).json({ success: true, message: 'Fichier téléchargé avec succès!' });
  });
});

app.get('/getFile/:filename', async (request: Request, response: Response) => {
  const { filename } = request.params;

  const command = new GetObjectCommand({
    Bucket: process.env.name as string,
    Key: filename,
  });

  try {
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // URL expire après 1 heure
    response.json({ success: true, url: signedUrl });
  } catch (error) {
    console.error('Erreur lors de la récupération du fichier:', error);
    response.status(500).json({ success: false, message: "Erreur lors de la génération de l'URL" });
  }
});

app.listen(3001, () => {
  console.log('Server listening on port 3001.');
});
