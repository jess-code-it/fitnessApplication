import { jwtDecode } from "jwt-decode"; 
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import { Navigate } from "react-router-dom";
import Swal from 'sweetalert2';

export default function Workout() {
    const [workouts, setWorkouts] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [newWorkout, setNewWorkout] = useState({ name: '', duration: '' });

    const token = localStorage.getItem('token');
    const data = jwtDecode(token);
    const userId = data.id;
    const API_URL_ADD_WORKOUT = `${import.meta.env.VITE_API_URL}/workouts/addWorkout`;
    const API_URL_FETCH_WORKOUT = `${import.meta.env.VITE_API_URL}/workouts/getMyWorkouts`;
    const API_URL_UPDATE_WORKOUT = `${import.meta.env.VITE_API_URL}/workouts/updateWorkout`;
    const API_URL_DELETE_WORKOUT = `${import.meta.env.VITE_API_URL}/workouts/deleteWorkout`;
    const API_URL_UPDATE_STATUS = `${import.meta.env.VITE_API_URL}/workouts/completeWorkoutStatus`;
    

    useEffect(() => {
            console.log(token, userId);
            fetch(API_URL_FETCH_WORKOUT, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(data => {
                console.log(data);
                if (data.workouts && Array.isArray(data.workouts)) {
                    setWorkouts(data.workouts);
                } else if (data.message) {
                    console.log(data.message);
                    setWorkouts([]);
                } else {
                    console.error("Unexpected data format", data);
                    setWorkouts([]);
                }
            })
            .catch(err => console.error("Fetch workouts error:", err));
    }, [API_URL_FETCH_WORKOUT]);

    const handleAddWorkout = () => {
        fetch(API_URL_ADD_WORKOUT, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(newWorkout)
        })
        .then(res => res.json())
        .then(data => {
            setWorkouts([...workouts, data]);
            setShowAddModal(false);
            setNewWorkout({ name: '', duration: '' });
            Swal.fire({
                title: "Workout Added",
                icon: "success",
                text: "The workout has been added."
            });
            console.log(data);
        })
        .catch(err => console.error(err));
    };

    const handleUpdateWorkout = () => {
        const token = localStorage.getItem('token');
        fetch(`${API_URL_UPDATE_WORKOUT}/${selectedWorkout._id}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(selectedWorkout)
        })
        .then(res => {
            
            if (res.ok) {
                
                return res.json();
            } else {
                throw new Error('Failed to update workout');
            }
            
        })
        .then(data => {
            setWorkouts(workouts.map(w => w._id === data.updatedWorkout._id ? data.updatedWorkout : w));
            setShowUpdateModal(false);
            Swal.fire({
                title: "Workout Updated",
                icon: "success",
                text: "The workout has been updated."
            });
        })
        .catch(err => {
            console.error(err);
            Swal.fire({
                title: "Workout not Updated",
                icon: "error",
                text: "The workout update failed. Please try again."
            });
        });
    };

    const handleDeleteWorkout = () => {
        const token = localStorage.getItem('token'); // Ensure token is fetched
        fetch(`${API_URL_DELETE_WORKOUT}/${selectedWorkout._id}`, {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        })
        .then(res => {
            if (res.ok) {
                setWorkouts(workouts.filter(w => w._id !== selectedWorkout._id));
                setShowDeleteModal(false);
                Swal.fire({
                    title: "Workout Deleted",
                    icon: "success",
                    text: "The workout has been deleted."
                });
            } else {
                throw new Error('Failed to delete workout');
            }
        })
        .catch(err => console.error("Delete workout error:", err));
    };
    
    const handleUpdateStatus = (workoutId, currentStatus) => {
        const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
    
        fetch(`${API_URL_UPDATE_STATUS}/${workoutId}`, {
            method: 'PATCH',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(res => {
            if (res.ok) {
                return res.json();
            } else {
                return res.text().then(text => { throw new Error(text); });
            }
        })
        .then(data => {
            console.log('Update successful:', data);
            setWorkouts(workouts.map(w => w._id === data.updatedWorkout._id ? data.updatedWorkout : w));
            Swal.fire({
                title: "Status Updated",
                icon: "success",
                text: `The workout status has been updated to ${newStatus}.`
            });
        })
        .catch(err => {
            console.error('Update error:', err);
            Swal.fire({
                title: "Status Update Failed",
                icon: "error",
                text: "The status update failed. Please try again."
            });
        });
    };
    return (
        <>
            {workouts.length === 0 ? (
                <p className="text-center mt-5">No workouts found. Please add some workouts.{workouts.userId}</p>
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                            <th>Update Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workouts.map(w => (
                            
                            <tr key={w._id}>
                                <td>{w.userId}</td>
                                <td>{w.name}</td>
                                <td>{w.duration}</td>
                                <td>{w.status}</td>
                                <td>
                                    <Button variant="warning" onClick={() => { setSelectedWorkout(w); setShowUpdateModal(true); }}>Update</Button>
                                    <Button variant="danger" onClick={() => { setSelectedWorkout(w); setShowDeleteModal(true); }}>Delete</Button>
                                </td>
                                <td>
                                    <Button variant="info" onClick={() => handleUpdateStatus(w._id, w.status)}>
                                        Mark as {w.status === 'pending' ? 'Complete' : 'Pending'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {/* Add Workout Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Workout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formWorkoutName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter workout name"
                                value={newWorkout.name || ''}
                                onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formWorkoutDuration">
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter workout duration"
                                value={newWorkout.duration || ''}
                                onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleAddWorkout}>Add Workout</Button>
                </Modal.Footer>
            </Modal>

            {/* Update Workout Modal */}
            <Modal show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Update Workout</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formWorkoutName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedWorkout?.name || ''}
                                onChange={(e) => setSelectedWorkout({ ...selectedWorkout, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="formWorkoutDuration">
                            <Form.Label>Duration</Form.Label>
                            <Form.Control
                                type="text"
                                value={selectedWorkout?.duration || ''}
                                onChange={(e) => setSelectedWorkout({ ...selectedWorkout, duration: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>Close</Button>
                    <Button variant="primary" onClick={handleUpdateWorkout}>Update Workout</Button>
                </Modal.Footer>
            </Modal>

            {/* Delete Workout Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this workout?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteWorkout}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* Button to Show Add Workout Modal */}
            <Button variant="primary" onClick={() => setShowAddModal(true)}>Add Workout</Button>
        </>
    );
}
