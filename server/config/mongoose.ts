import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect('mongodb+srv://votybe:Votybe@votybemedia.80evc.mongodb.net/');
    const db = mongoose.connection;
    console.log('MongoDB Connected', db.host);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export { connectDB };
