import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { db } from "../config"; // Import your Firebase Firestore configuration

const PhotoDetailScreen = ({ route }) => {
  // Destructure necessary data from route params
  const { photoUri, photoName, photoDescription, eventId, userId, photoId } = route.params;
  console.log(photoId);
  // State variables for comment input and comments list
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [likeNumber, setLikeNumber] = useState(0);

  // Function to handle adding a comment
  const addComment = async () => {
    try {
      if (commentInput.trim() !== "") {
        // Construct comment object
        const newComment = {
          text: commentInput,
          userId: userId,
          timestamp: new Date().toISOString(),
        };
  
        // Add the new comment to the existing comments array in Firestore
        await db.doc(`users/${userId}/events/${eventId}/photos/${photoId}`).update({
          comments: [...comments, newComment],
        });
  
        // Update the comments list in the state
        setComments((prevComments) => [...prevComments, newComment]);
  
        // Clear comment input
        setCommentInput("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Function to handle liking a photo
  const likePhoto = async () => {
    try {
      const photoDocRef = db.doc(`users/${userId}/events/${eventId}/photos/${photoId}`);
      await photoDocRef.update({
        likeNumber: likeNumber + 1,
      });
      setLikeNumber(likeNumber + 1);
    } catch (error) {
      console.error("Error liking photo:", error);
    }
  };

  // Fetch initial comments and like count
  useEffect(() => {
    const fetchPhotoData = async () => {
      try {
        const photoDocRef = db.doc(`users/${userId}/events/${eventId}/photos/${photoId}`);
        const photoDocSnapshot = await photoDocRef.get();
        if (photoDocSnapshot.exists) {
          const photoData = photoDocSnapshot.data();
          setComments(photoData.comments || []);
          setLikeNumber(photoData.likeNumber || 0);
        }
      } catch (error) {
        console.error("Error fetching photo data:", error);
      }
    };
    fetchPhotoData();
  }, []);


  return (
    <View style={styles.container}>
      <Image source={{ uri: photoUri }} style={styles.photo} />
      <View style={styles.commentsContainer}>
        {/* Display existing comments */}
        {comments.map((comment, index) => (
          <Text key={index} style={styles.commentText}>
            {comment.text}
          </Text>
        ))}
        {/* Input for adding a new comment */}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder="Add a comment..."
            onSubmitEditing={addComment}
          />
          <TouchableOpacity style={styles.sendButton} onPress={addComment}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Button for liking the photo */}
      <TouchableOpacity style={styles.likeButton} onPress={likePhoto}>
        <Text style={styles.likeButtonText}>Like ({likeNumber})</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  photo: {
    flex: 1,
    resizeMode: "cover",
  },
  commentsContainer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  commentText: {
    marginBottom: 5,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  sendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#6b92ed",
    borderRadius: 20,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  likeButton: {
    backgroundColor: "#6b92ed",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 10,
  },
  likeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default PhotoDetailScreen;
