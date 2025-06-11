// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./SkillLoopEscrow.sol";

/**
 * @title SkillLoopCertificate
 * @dev NFT contract for issuing skill certificates upon completion of learning sessions
 */
contract SkillLoopCertificate is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    // Counter for token IDs
    Counters.Counter private _tokenIds;
    
    // Reference to the escrow contract
    SkillLoopEscrow public escrowContract;
    
    // Mapping from sessionId to tokenId
    mapping(bytes32 => uint256) public sessionCertificates;
    
    // Certificate details struct
    struct Certificate {
        uint256 tokenId;
        bytes32 sessionId;
        address issuer;
        address recipient;
        string skill;
        uint256 timestamp;
    }
    
    // Mapping from tokenId to Certificate
    mapping(uint256 => Certificate) public certificates;
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        bytes32 indexed sessionId,
        address indexed recipient,
        address issuer,
        string skill
    );
    
    /**
     * @dev Constructor
     * @param escrowAddress Address of the SkillLoopEscrow contract
     */
    constructor(address escrowAddress) ERC721("SkillLoop Certificate", "SLC") {
        escrowContract = SkillLoopEscrow(escrowAddress);
    }
    
    /**
     * @dev Set a new escrow contract address
     * @param newEscrowAddress Address of the new escrow contract
     */
    function setEscrowContract(address newEscrowAddress) external onlyOwner {
        escrowContract = SkillLoopEscrow(newEscrowAddress);
    }
    
    /**
     * @dev Mint a new certificate for a completed session
     * @param sessionId Unique identifier for the session
     * @param recipient Address of the certificate recipient
     * @param issuer Address of the certificate issuer (typically the tutor)
     * @param skill Name of the skill certified
     * @param tokenURI URI for the token metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintCertificate(
        bytes32 sessionId,
        address recipient,
        address issuer,
        string memory skill,
        string memory tokenURI
    ) external returns (uint256) {
        // Verify the caller is authorized (platform contract)
        require(msg.sender == owner(), "Only owner can mint certificates");
        
        // Verify the session exists and is completed
        (
            address tutor,
            address learner,
            ,
            ,
            ,
            ,
            ,
            bool completed,
            bool canceled
        ) = escrowContract.getSession(sessionId);
        
        require(completed, "Session not completed");
        require(!canceled, "Session was canceled");
        require(
            (recipient == learner && issuer == tutor) || 
            (recipient == tutor && issuer == learner),
            "Invalid recipient or issuer"
        );
        require(sessionCertificates[sessionId] == 0, "Certificate already minted for this session");
        
        // Increment token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mint the token
        _mint(recipient, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        // Store certificate details
        certificates[newTokenId] = Certificate({
            tokenId: newTokenId,
            sessionId: sessionId,
            issuer: issuer,
            recipient: recipient,
            skill: skill,
            timestamp: block.timestamp
        });
        
        // Map session to certificate
        sessionCertificates[sessionId] = newTokenId;
        
        emit CertificateMinted(newTokenId, sessionId, recipient, issuer, skill);
        
        return newTokenId;
    }
    
    /**
     * @dev Get certificate details
     * @param tokenId The ID of the certificate token
     * @return Certificate details
     */
    function getCertificate(uint256 tokenId) external view returns (
        uint256 id,
        bytes32 sessionId,
        address issuer,
        address recipient,
        string memory skill,
        uint256 timestamp
    ) {
        require(_exists(tokenId), "Certificate does not exist");
        
        Certificate memory cert = certificates[tokenId];
        
        return (
            cert.tokenId,
            cert.sessionId,
            cert.issuer,
            cert.recipient,
            cert.skill,
            cert.timestamp
        );
    }
}