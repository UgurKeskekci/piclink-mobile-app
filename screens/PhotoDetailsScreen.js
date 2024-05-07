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
const [showCommentInput, setShowCommentInput] = useState(false); // Change to true

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

      <View style={styles.interaction}>
  <View style={styles.iconContainer}>
    <TouchableOpacity onPress={likePhoto}>
      <Icon name="heart-outline" size={30} color="black" />
    </TouchableOpacity>
    <Text style={styles.titleText}>{likeNumber} Likes</Text>
  </View>
  <View style={styles.iconContainer}>
    <TouchableOpacity onPress={() => setShowCommentInput(!showCommentInput)}>
      <Icon name="chatbubble-outline" size={27} color="black" />
    </TouchableOpacity>
    <Text style={styles.titleText}>{comments.length} Comments</Text>
  </View>
</View>

<View style={styles.detailsContainer}>
        <View style={styles.eventDetail}>
          <Text style={styles.name}>{photoName}</Text>
          <Text style={styles.description}> {photoDescription}</Text>
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
    borderBottomColor: "rgba(0, 0, 0, 0.2)",
  },
  photo: {
    flex: 0.6,
    height: "%100",
    margin: 20,
  },
  detailsContainer: {
    flex: 0.6,
    padding: 10,
  },
  eventDetail: {
    flexDirection: "column",
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 30, // Adjust the spacing between icon and text if needed
  },
  
  titleText: {
    marginLeft: 8, // Adjust the spacing between icon and text if needed
  },
  
  interaction: {
    flexDirection: "row",
    marginBottom: 10,
    marginTop: 20,
    marginLeft: 20,

  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    paddingTop: 5,
    marginLeft: 15,
  },
  description: {
    fontSize: 16,
    paddingTop: 5,
    marginLeft: 12,
    
  },
  commentContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginLeft: 15, // Adjust the left margin as needed
    marginRight: 15, // Adjust the right margin as needed
  },
  commentInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
    paddingVertical: 8, // Adjust the vertical padding as needed
    fontSize: 16, // Adjust the font size as needed
  },
  submitButton: {
    color: "blue",
    fontWeight: "bold",
  },
  commentText: {
    marginTop: 5,
    fontSize: 16,
    marginLeft: 20,
  },
  showMoreButton: {
    color: "blue",
    marginTop: 10,
  },
});

export default PhotoDetailScreen;
