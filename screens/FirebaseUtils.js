// FirebaseUtils.js
import { db, storage } from "../config";
import { getDocs, doc, setDoc } from "firebase/firestore";
import * as FileSystem from "expo-file-system";

export const fetchPhotosFromFirebase = async (userId, eventId) => {
  try {
    const photosSnapshot = await getDocs(db.collection(`users/${userId}/events/${eventId}/photos`));
    return photosSnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error("Error fetching photos from Firebase:", error);
    throw error;
  }
};

export const storePhotosInFirestore = async (userId, eventId, photos) => {
  try {
    const photosRef = db.collection(`users/${userId}/events/${eventId}/photos`);
    await Promise.all(photos.map(async (photo) => {
      await setDoc(doc(photosRef, photo.photoId), photo);
    }));
    console.log("Photos uploaded and data stored successfully!");
  } catch (error) {
    console.error("Error storing photo data in Firestore:", error);
    throw error;
  }
};

export const uploadPhotoToStorage = async (photoUri, eventId, userId) => {
  try {
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const imageName = photoUri.substring(photoUri.lastIndexOf("/") + 1);
    const storagePath = `eventPhotos/${eventId}/${imageName}`;
    const storageRef = storage.ref().child(storagePath);
    await storageRef.put(blob);
    const downloadURL = await storageRef.getDownloadURL();
    return {
      accessUrl: downloadURL,
      additionDate: new Date().toISOString(),
      likeNumber: 0,
      comments: [],
      owner: userId,
      photoId: imageName,
    };
  } catch (error) {
    console.error("Error uploading photo to Firebase Storage:", error);
    throw error;
  }
};
