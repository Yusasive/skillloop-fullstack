// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SkillLoopEscrow
 * @dev Contract for managing token escrow for learning sessions between tutors and learners
 */
contract SkillLoopEscrow is Ownable, ReentrancyGuard {
    // Session data structure
    struct Session {
        address tutor;
        address learner;
        uint256 amount;
        uint256 startTime;
        uint256 endTime;
        bool tutorConfirmed;
        bool learnerConfirmed;
        bool completed;
        bool canceled;
    }

    // Mapping from sessionId to Session
    mapping(bytes32 => Session) public sessions;

    // Events
    event SessionCreated(
        bytes32 indexed sessionId,
        address indexed tutor,
        address indexed learner,
        uint256 amount,
        uint256 startTime,
        uint256 endTime
    );
    
    event SessionConfirmed(
        bytes32 indexed sessionId,
        address indexed confirmedBy,
        bool isCompleted
    );
    
    event SessionCanceled(bytes32 indexed sessionId);
    
    event TokensReleased(
        bytes32 indexed sessionId,
        address indexed recipient,
        uint256 amount
    );

    /**
     * @dev Create a new learning session with escrow
     * @param sessionId Unique identifier for the session
     * @param tutor Address of the tutor
     * @param startTime Start time of the session (unix timestamp)
     * @param endTime End time of the session (unix timestamp)
     */
    function createSession(
        bytes32 sessionId,
        address tutor,
        uint256 startTime,
        uint256 endTime
    ) external payable nonReentrant {
        require(msg.value > 0, "Amount must be greater than zero");
        require(tutor != msg.sender, "Tutor cannot be the learner");
        require(startTime > block.timestamp, "Start time must be in the future");
        require(endTime > startTime, "End time must be after start time");
        require(sessions[sessionId].tutor == address(0), "Session ID already exists");

        Session memory newSession = Session({
            tutor: tutor,
            learner: msg.sender,
            amount: msg.value,
            startTime: startTime,
            endTime: endTime,
            tutorConfirmed: false,
            learnerConfirmed: false,
            completed: false,
            canceled: false
        });

        sessions[sessionId] = newSession;

        emit SessionCreated(
            sessionId,
            tutor,
            msg.sender,
            msg.value,
            startTime,
            endTime
        );
    }

    /**
     * @dev Confirm session completion
     * @param sessionId Unique identifier for the session
     */
    function confirmSession(bytes32 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        
        require(session.tutor != address(0), "Session does not exist");
        require(!session.canceled, "Session was canceled");
        require(!session.completed, "Session already completed");
        require(
            msg.sender == session.tutor || msg.sender == session.learner,
            "Only tutor or learner can confirm"
        );

        if (msg.sender == session.tutor) {
            session.tutorConfirmed = true;
        } else {
            session.learnerConfirmed = true;
        }

        emit SessionConfirmed(sessionId, msg.sender, false);

        // If both tutor and learner confirmed, release tokens and mark as completed
        if (session.tutorConfirmed && session.learnerConfirmed) {
            session.completed = true;
            
            emit SessionConfirmed(sessionId, msg.sender, true);
            
            // Transfer payment to tutor
            (bool success, ) = session.tutor.call{value: session.amount}("");
            require(success, "Transfer to tutor failed");
            
            emit TokensReleased(sessionId, session.tutor, session.amount);
        }
    }

    /**
     * @dev Cancel a session before it starts
     * @param sessionId Unique identifier for the session
     */
    function cancelSession(bytes32 sessionId) external nonReentrant {
        Session storage session = sessions[sessionId];
        
        require(session.tutor != address(0), "Session does not exist");
        require(!session.completed, "Session already completed");
        require(!session.canceled, "Session already canceled");
        require(
            msg.sender == session.tutor || msg.sender == session.learner,
            "Only tutor or learner can cancel"
        );
        
        // Only allow cancellation before session starts
        require(block.timestamp < session.startTime, "Session has already started");

        session.canceled = true;
        
        emit SessionCanceled(sessionId);
        
        // Refund the learner
        (bool success, ) = session.learner.call{value: session.amount}("");
        require(success, "Refund to learner failed");
        
        emit TokensReleased(sessionId, session.learner, session.amount);
    }

    /**
     * @dev Withdraw funds in case of emergency (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }
    
    /**
     * @dev Get session details
     * @param sessionId Unique identifier for the session
     * @return Session details
     */
    function getSession(bytes32 sessionId) external view returns (
        address tutor,
        address learner,
        uint256 amount,
        uint256 startTime,
        uint256 endTime,
        bool tutorConfirmed,
        bool learnerConfirmed,
        bool completed,
        bool canceled
    ) {
        Session memory session = sessions[sessionId];
        return (
            session.tutor,
            session.learner,
            session.amount,
            session.startTime,
            session.endTime,
            session.tutorConfirmed,
            session.learnerConfirmed,
            session.completed,
            session.canceled
        );
    }
}