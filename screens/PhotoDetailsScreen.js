import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { db } from "../config"; // Import your Firebase Firestore configuration
import Icon from "react-native-vector-icons/Ionicons";

const PhotoDetailScreen = ({ route }) => {
  // Destructure necessary data from route params
  const { photoUri, photoName, photoDescription, eventId, userId, photoId } =
    route.params;
  console.log(photoId);
  // State variables for comment input and comments list
  const [commentInput, setCommentInput] = useState("");
  const [comments, setComments] = useState([]);
  const [likeNumber, setLikeNumber] = useState(0);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showCommentInput, setShowCommentInput] = useState(false);

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
        await db
          .doc(`users/${userId}/events/${eventId}/photos/${photoId}`)
          .update({
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
      const photoDocRef = db.doc(
        `users/${userId}/events/${eventId}/photos/${photoId}`
      );
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
        const photoDocRef = db.doc(
          `users/${userId}/events/${eventId}/photos/${photoId}`
        );
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
      <View style={styles.separator}></View>

      <View style={styles.detailsContainer}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.name}>{photoName}</Text>
          <Text style={styles.description}> {photoDescription}</Text>
        </View>

        <View
          style={{ flexDirection: "row", marginBottom: 10, paddingTop: 10 }}
        >
          <TouchableOpacity onPress={likePhoto}>
            <Icon name="heart-outline" size={30} color="black" />
          </TouchableOpacity>
          <Text style={{ paddingRight: 40, paddingTop: 2 }}>
            {likeNumber} Likes
          </Text>
          <TouchableOpacity
            onPress={() => setShowCommentInput(!showCommentInput)}
          >
            <Icon name="chatbubble-outline" size={27} color="black" />
          </TouchableOpacity>

          <Text style={{ paddingRight: 40, paddingTop: 2 }}>
            {comments.length} Comments
          </Text>
        </View>

        {/* Render comments */}
        {comments
  .slice(0, showAllComments ? comments.length : 2)
  .map((comment, index) => (
    <Text key={index} style={styles.commentText}>
      {comment.text} {/* Render the comment text */}
    </Text>
  ))}


        {/* Show more comments button */}
        {!showAllComments && comments.length > 2 && (
          <TouchableOpacity onPress={() => setShowAllComments(true)}>
            <Text style={styles.showMoreButton}>Show More Comments</Text>
          </TouchableOpacity>
        )}

        {/* Render comment input field if showCommentInput is true */}
        {showCommentInput && (
          <View style={styles.commentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              onChangeText={setCommentInput}
              value={commentInput}
              onSubmitEditing={addComment}
            />
            <TouchableOpacity onPress={addComment}>
              <Text style={styles.submitButton}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "black",
  },
  photo: {
    flex: 0.6,
    resizeMode: "cover",
  },
  detailsContainer: {
    flex: 0.6,
    padding: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    paddingTop: 2,
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  submitButton: {
    color: "blue",
    fontWeight: "bold",
  },
  commentText: {
    marginTop: 5,
    fontSize: 16,
  },
  showMoreButton: {
    color: "blue",
    marginTop: 10,
  },
});

export default PhotoDetailScreen;
