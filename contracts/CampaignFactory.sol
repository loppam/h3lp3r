// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CampaignFactory is Ownable {
    using SafeERC20 for IERC20;

    // Dev wallet address (can be changed later)
    address public constant DEV_WALLET = 0x065eFb8cbD9669648f4d765b6D25304F66419C47;
    
    constructor() Ownable(msg.sender) {}
    
    // Array to store all deployed campaigns
    address[] public campaigns;
    
    // Mapping to store campaign codes
    mapping(string => address) public campaignByCode;
    
    // Event emitted when a new campaign is created
    event CampaignCreated(
        address indexed campaignAddress,
        address indexed creator,
        address tokenAddress,
        uint256 goalAmount,
        uint256 deadline,
        string title,
        string description,
        string code
    );

    // Function to create a new campaign
    function createCampaign(
        address _tokenAddress,
        uint256 _goalAmount,
        uint256 _durationInDays,
        string memory _title,
        string memory _description,
        string memory _code
    ) external returns (address) {
        // Check if code is already taken
        require(campaignByCode[_code] == address(0), "Campaign code already exists");
        require(bytes(_code).length == 4, "Campaign code must be 4 characters");
        
        // Create new campaign contract
        FundCampaign newCampaign = new FundCampaign(
            msg.sender,
            _tokenAddress,
            _goalAmount,
            DEV_WALLET,
            block.timestamp + (_durationInDays * 1 days),
            _title,
            _description,
            _code
        );
        
        // Store the campaign address
        campaigns.push(address(newCampaign));
        campaignByCode[_code] = address(newCampaign);
        
        // Emit event
        emit CampaignCreated(
            address(newCampaign),
            msg.sender,
            _tokenAddress,
            _goalAmount,
            block.timestamp + (_durationInDays * 1 days),
            _title,
            _description,
            _code
        );
        
        return address(newCampaign);
    }

    // Function to get all campaigns
    function getAllCampaigns() external view returns (address[] memory) {
        return campaigns;
    }

    // Function to get campaign by code
    function getCampaignByCode(string memory _code) external view returns (address) {
        return campaignByCode[_code];
    }

    // Function to remove a campaign from the list
    function removeCampaign(address _campaign) external {
        require(msg.sender == _campaign, "Only campaign can remove itself");
        for (uint256 i = 0; i < campaigns.length; i++) {
            if (campaigns[i] == _campaign) {
                campaigns[i] = campaigns[campaigns.length - 1];
                campaigns.pop();
                break;
            }
        }
    }
}

contract FundCampaign is Pausable {
    using SafeERC20 for IERC20;

    // Campaign details
    address public immutable creator;
    address public immutable tokenAddress;
    uint256 public immutable goalAmount;
    address public immutable devWallet;
    uint256 public immutable deadline;
    string public title;
    string public description;
    string public code;
    address public immutable factory;
    
    // Campaign state
    uint256 public totalFunds;
    bool public isWithdrawn;
    bool public isCompleted;
    
    // Events
    event Funded(address indexed donor, uint256 amount);
    event Withdrawn(address indexed recipient, uint256 amount);
    event DevFeePaid(uint256 amount);
    event CampaignCompleted();

    constructor(
        address _creator,
        address _tokenAddress,
        uint256 _goalAmount,
        address _devWallet,
        uint256 _deadline,
        string memory _title,
        string memory _description,
        string memory _code
    ) {
        creator = _creator;
        tokenAddress = _tokenAddress;
        goalAmount = _goalAmount;
        devWallet = _devWallet;
        deadline = _deadline;
        title = _title;
        description = _description;
        code = _code;
        factory = msg.sender; // The factory is the one deploying this contract
    }

    // Function to fund the campaign
    function fund(uint256 _amount) external payable whenNotPaused {
        require(!isWithdrawn, "Campaign already withdrawn");
        require(block.timestamp <= deadline, "Campaign deadline passed");
        
        if (tokenAddress == address(0)) {
            // Native ETH funding
            require(msg.value == _amount, "Incorrect ETH amount");
            totalFunds += _amount;
        } else {
            // ERC20 token funding
            IERC20 token = IERC20(tokenAddress);
            token.safeTransferFrom(msg.sender, address(this), _amount);
            totalFunds += _amount;
        }
        
        // Check if goal is reached
        if (totalFunds >= goalAmount && !isCompleted) {
            isCompleted = true;
            emit CampaignCompleted();
        }
        
        emit Funded(msg.sender, _amount);
    }

    // Function to withdraw funds
    function withdraw() external whenNotPaused {
        require(!isWithdrawn, "Campaign already withdrawn");
        require(
            msg.sender == creator || msg.sender == devWallet,
            "Only creator or dev can withdraw"
        );
        
        isWithdrawn = true;
        uint256 balance = totalFunds;
        
        if (tokenAddress == address(0)) {
            // Native ETH withdrawal
            uint256 devFee = (balance * 3) / 100; // 3% dev fee
            uint256 creatorAmount = balance - devFee;
            
            (bool success, ) = creator.call{value: creatorAmount}("");
            require(success, "ETH transfer to creator failed");
            
            (success, ) = devWallet.call{value: devFee}("");
            require(success, "ETH transfer to dev failed");
            
            emit Withdrawn(creator, creatorAmount);
            emit DevFeePaid(devFee);
        } else {
            // ERC20 token withdrawal
            IERC20 token = IERC20(tokenAddress);
            uint256 devFee = (balance * 3) / 100; // 3% dev fee
            uint256 creatorAmount = balance - devFee;
            
            token.safeTransfer(creator, creatorAmount);
            token.safeTransfer(devWallet, devFee);
            
            emit Withdrawn(creator, creatorAmount);
            emit DevFeePaid(devFee);
        }

        // Remove campaign from factory
        CampaignFactory(factory).removeCampaign(address(this));
    }

    // Function to get campaign details
    function getCampaignDetails() external view returns (
        address _creator,
        address _tokenAddress,
        uint256 _goalAmount,
        uint256 _totalFunds,
        bool _isWithdrawn,
        bool _isCompleted,
        uint256 _deadline,
        string memory _title,
        string memory _description,
        string memory _code
    ) {
        return (
            creator,
            tokenAddress,
            goalAmount,
            totalFunds,
            isWithdrawn,
            isCompleted,
            deadline,
            title,
            description,
            code
        );
    }

    // Emergency pause function (only for security purposes)
    function pause() external {
        require(msg.sender == devWallet, "Only dev can pause");
        _pause();
    }

    function unpause() external {
        require(msg.sender == devWallet, "Only dev can unpause");
        _unpause();
    }
} 