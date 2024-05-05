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
export const copyPhotosInStorage = async (sourcePath, destinationPath) => {
  try {
    // Get reference to the source path
    const sourceRef = storage.ref(sourcePath);
    // List all items (photos) in the source path
    const { items } = await sourceRef.listAll();

    // Iterate through each photo and copy it to the destination path
    await Promise.all(
      items.map(async (item) => {
        const destinationRef = storage.ref(destinationPath).child(item.name);
        await item.copyTo(destinationRef);
      })
    );

    console.log("Photos copied successfully.");
  } catch (error) {
    console.error("Error copying photos:", error);
  }
};

export const fetchPhotosFromStorage = async (userId, eventId) => {
  try {
    const storagePath = `eventPhotos/${eventId}/`;
    const storageRef = storage.ref().child(storagePath);
    
    // List all items (photos) in the storage folder
    const storageItems = await storageRef.listAll();
    
    // Get download URLs for each photo
    const photoPromises = storageItems.items.map(async (item) => {
      const downloadURL = await item.getDownloadURL();
      return {
        accessUrl: downloadURL,
        additionDate: new Date().toISOString(),
        likeNumber: 0,
        comments: [],
        owner: userId,
        photoId: item.name,
      };
    });
    
    // Wait for all promises to resolve
    const photos = await Promise.all(photoPromises);
    return photos;
  } catch (error) {
    console.error("Error fetching photos from Firebase Storage:", error);
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
