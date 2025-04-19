import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import CampaignFactoryJson from "@/contracts/CampaignFactory.json";

// Contract addresses (replace with your deployed addresses)
export const CONTRACT_ADDRESSES = {
  factory: "YOUR_FACTORY_ADDRESS",
};

// Contract ABIs
export const CAMPAIGN_FACTORY_ABI = [
  "function createCampaign(address _tokenAddress, uint256 _goalAmount) external returns (address)",
  "function getAllCampaigns() external view returns (address[])",
  "event CampaignCreated(address indexed campaignAddress, address indexed creator, address tokenAddress, uint256 goalAmount)",
];

export const FUND_CAMPAIGN_ABI = [
  "function fund(uint256 _amount) external payable",
  "function withdraw() external",
  "function getCampaignDetails() external view returns (address, address, uint256, uint256, bool)",
  "event Funded(address indexed donor, uint256 amount)",
  "event Withdrawn(address indexed recipient, uint256 amount)",
  "event DevFeePaid(uint256 amount)",
];

export function useCampaignFactory() {
  const { data: walletClient } = useWalletClient();

  const getContract = () => {
    if (!walletClient) return null;
    const provider = new ethers.providers.Web3Provider(
      walletClient as ethers.providers.ExternalProvider
    );
    const signer = provider.getSigner();
    return new ethers.Contract(
      process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS!,
      CampaignFactoryJson.abi,
      signer
    );
  };

  return getContract();
}

const CAMPAIGN_FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || "";

export interface Campaign {
  address: string;
  creator: string;
  title: string;
  description: string;
  goal: string;
  raised: string;
  isActive: boolean;
  tokenAddress: string;
}

function generateCampaignCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createCampaign(
  tokenAddress: string,
  goal: string,
  signer: ethers.Signer
): Promise<{ address: string; code: string }> {
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    signer
  );

  const code = generateCampaignCode();
  const goalWei = ethers.utils.parseEther(goal);

  const tx = await factory.createCampaign(tokenAddress, goalWei, code);
  const receipt = await tx.wait();

  const event = receipt.events?.find(
    (e: ethers.Event) => e.event === "CampaignCreated"
  );
  if (!event) throw new Error("Campaign creation failed");

  return {
    address: event.args.campaign,
    code,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const provider = new ethers.providers.Web3Provider(
    window.ethereum as ethers.providers.ExternalProvider
  );
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    provider
  );

  const campaignAddresses = await factory.getAllCampaigns();

  // Get details for each campaign
  const campaigns = await Promise.all(
    campaignAddresses.map(async (address: string) => {
      const campaign = new ethers.Contract(
        address,
        FUND_CAMPAIGN_ABI,
        provider
      );
      const [creator, tokenAddress, goal, raised, isActive] =
        await campaign.getCampaignDetails();
      return {
        address,
        creator,
        title: "Campaign", // Default title
        description: "Help needed", // Default description
        goal: goal.toString(),
        raised: raised.toString(),
        tokenAddress,
        isActive,
      };
    })
  );

  return campaigns;
}

export async function getCampaignByCode(
  code: string
): Promise<Campaign | null> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const provider = new ethers.providers.Web3Provider(
    window.ethereum as ethers.providers.ExternalProvider
  );
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    provider
  );

  try {
    const campaign = await factory.getCampaignByCode(code);
    return {
      address: campaign.campaign,
      creator: campaign.creator,
      title: campaign.title,
      description: campaign.description,
      goal: campaign.goal.toString(),
      raised: campaign.raised.toString(),
      tokenAddress: campaign.tokenAddress,
      isActive: campaign.isActive,
    };
  } catch (err) {
    console.error("Error fetching campaign:", err);
    return null;
  }
}

export async function fundCampaign(
  campaignAddress: string,
  amount: string,
  tokenAddress: string,
  signer: ethers.Signer
) {
  const campaign = new ethers.Contract(
    campaignAddress,
    FUND_CAMPAIGN_ABI,
    signer
  );

  const amountWei = ethers.utils.parseEther(amount);

  if (tokenAddress === ethers.constants.AddressZero) {
    // ETH funding
    const tx = await campaign.fund(amountWei, { value: amountWei });
    return tx.wait();
  } else {
    // ERC20 funding
    const tx = await campaign.fund(amountWei);
    return tx.wait();
  }
}

export async function withdrawCampaign(
  campaignAddress: string,
  signer: ethers.Signer
) {
  const campaign = new ethers.Contract(
    campaignAddress,
    FUND_CAMPAIGN_ABI,
    signer
  );

  const tx = await campaign.withdraw();
  return tx.wait();
}

export async function getCampaignDetails(
  campaignAddress: string,
  provider: ethers.providers.Provider
) {
  const campaign = new ethers.Contract(
    campaignAddress,
    FUND_CAMPAIGN_ABI,
    provider
  );

  const [creator, tokenAddress, goalAmount, totalFunds, isWithdrawn] =
    await campaign.getCampaignDetails();

  return {
    creator,
    tokenAddress,
    goalAmount: ethers.utils.formatEther(goalAmount),
    totalFunds: ethers.utils.formatEther(totalFunds),
    isWithdrawn,
  };
}
