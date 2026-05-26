import "../../animations.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Server_URL } from "../../utils/config";
import { getAuthToken } from "../../utils/auth";
import { motion } from "framer-motion";
import { FaBookOpen, FaTags, FaBarcode, FaRupeeSign, FaInfoCircle } from "react-icons/fa";
import { RiBookmarkLine } from "react-icons/ri";
import "./bookdetails.css"
import { showErrorToast, showSuccessToast } from "../../utils/toasthelper";


function BookDetails() {
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isIssuing, setIsIssuing] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [activeReservation, setActiveReservation] = useState(null);

    // async function issueBook(bookid) {
    //     try {
    //         setIsIssuing(true);
    //         const authToken = localStorage.getItem("authToken");
    //         if (!authToken) {
    //             alert("Please login to issue a book.");
    //             return;
    //         }
    //         const url = Server_URL + 'books/issuebook/' + bookid;
    //         const response = await axios.post(url, {}, {
    //             headers: {
    //                 Authorization: `Bearer ${authToken}`,
    //             },
    //         });
    //         const { error, message } = response.data;
    //         if (error) {
    //             alert(message);
    //         } else {
    //             alert(message);
    //             // Refresh book data after issuing
    //             const updatedResponse = await axios.get(`${Server_URL}books/${id}`);
    //             setBook(updatedResponse.data);
    //         }
    //     } catch (error) {
    //         console.error("Error:", error.response?.data || error.message);
    //         alert(error.response?.data?.message || "Something went wrong! Please try again.");
    //     } finally {
    //         setIsIssuing(false);
    //     }
    // }
    async function issueBook(bookid) {
        try {
            setIsIssuing(true);
            const authToken = getAuthToken();
            if (!authToken) {
                showErrorToast("Please login to issue a book.");
                return;
            }
            const response = await axios.post(
                `${Server_URL}books/borrow/request-issue/${bookid}`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            const { error, message } = response.data;
            if (error) {
                showErrorToast(message);
            } else {
                showSuccessToast(message);
            }
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Something went wrong! Please try again.");
        } finally {
            setIsIssuing(false);
        }
    }

    async function reserveBook(bookid) {
        try {
            setIsReserving(true);
            const authToken = getAuthToken();
            if (!authToken) {
                showErrorToast("Please login to reserve a book.");
                return;
            }
            const response = await axios.post(
                `${Server_URL}reservations/reserve/${bookid}`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            const { error, message, reservation } = response.data;
            if (error) {
                showErrorToast(message);
            } else {
                showSuccessToast(message);
                setActiveReservation(reservation);
            }
        } catch (err) {
            showErrorToast(err.response?.data?.message || "Failed to reserve book. Please try again.");
        } finally {
            setIsReserving(false);
        }
    }

    async function checkExistingReservation(bookData) {
        const authToken = getAuthToken();
        if (!authToken || !bookData || bookData.availableCopies > 0) {
            setActiveReservation(null);
            return;
        }
        try {
            const res = await axios.get(`${Server_URL}reservations/my`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            const existing = (res.data.reservations || []).find(
                (r) =>
                    String(r.bookId?._id || r.bookId) === String(bookData._id) &&
                    ["Pending", "Notified"].includes(r.status)
            );
            setActiveReservation(existing || null);
        } catch {
            setActiveReservation(null);
        }
    }

    useEffect(() => {
        async function fetchBook() {
            try {
                setIsLoading(true);
                const response = await axios.get(`${Server_URL}books/${id}`);
                const bookData = response.data;
                setBook(bookData);
                setError(null);
                await checkExistingReservation(bookData);
            } catch (error) {
                console.error("Error fetching book:", error);
                setError("Failed to load book details. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        }
        fetchBook();
    }, [id]);

    if (isLoading) return (
        <div className="loading-container">
            <motion.div 
                className="spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            ></motion.div>
            <p>Loading book details...</p>
        </div>
    );

    if (error) return (
        <motion.div 
            className="error-message"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {error}
        </motion.div>
    );

    if (!book) return (
        <div className="not-found-container">
            <RiBookmarkLine className="not-found-icon" />
            <h2>Book Not Found</h2>
            <p>The book you're looking for doesn't exist or may have been removed.</p>
        </div>
    );

    return (
        <motion.div 
            className="book-details-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="book-details">
                <motion.div 
                    className="book-cover"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <img 
                        src={book.coverImage || '/default-book-cover.jpg'} 
                        alt={book.title} 
                        className="book-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-book-cover.jpg';
                        }}
                    />
                    {book.availableCopies !== undefined && (
                        <div className={`availability-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                            {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Out of Stock'}
                        </div>
                    )}
                </motion.div>
                
                <div className="book-info">
                    <div className="book-header">
                        <h1 className="book-title">{book.title}</h1>
                        <p className="book-author">by {book.author}</p>
                      
                    </div>
                    
                    <div className="book-meta">
                        <div className="meta-item">
                            <FaTags className="meta-icon" />
                            <div>
                                <span className="meta-label">Category</span>
                                <span className="meta-value">{book.category}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <FaBarcode className="meta-icon" />
                            <div>
                                <span className="meta-label">ISBN</span>
                                <span className="meta-value">{book.isbn}</span>
                            </div>
                        </div>
                        <div className="meta-item">
                            <FaRupeeSign className="meta-icon" />
                            <div>
                                <span className="meta-label">Price</span>
                                <span className="meta-value">₹{book.price}</span>
                            </div>
                        </div>

                    </div>
                    
                    <div className="book-description">
                        <h3>
                            <FaInfoCircle className="description-icon" />
                            Description
                        </h3>
                        <p>{book.description || "No description available for this book."}</p>
                    </div>
                    
                    <div className="action-buttons">
                        {book.availableCopies !== undefined && book.availableCopies <= 0 ? (
                            activeReservation ? (
                                <motion.button
                                    className="reserve-button reserved"
                                    disabled
                                >
                                    <RiBookmarkLine className="button-icon" />
                                    Reserved ({activeReservation.status})
                                </motion.button>
                            ) : (
                                <motion.button
                                    className="reserve-button"
                                    onClick={() => reserveBook(book._id)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isReserving}
                                >
                                    {isReserving ? (
                                        <span className="button-loader"></span>
                                    ) : (
                                        <>
                                            <RiBookmarkLine className="button-icon" />
                                            Reserve Book
                                        </>
                                    )}
                                </motion.button>
                            )
                        ) : (
                            <motion.button
                                className="issue-button"
                                onClick={() => issueBook(book._id)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isIssuing}
                            >
                                {isIssuing ? (
                                    <span className="button-loader"></span>
                                ) : (
                                    <>
                                        <FaBookOpen className="button-icon" />
                                        Issue This Book
                                    </>
                                )}
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
            
          
           
        </motion.div>
    );
}

export default BookDetails;