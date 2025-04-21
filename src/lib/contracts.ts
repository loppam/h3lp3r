import { useWalletClient } from "wagmi";
import { ethers } from "ethers";
import CampaignFactoryJson from "@/contracts/CampaignFactory.json";

// Contract addresses (replace with your deployed addresses)
export const CONTRACT_ADDRESSES = {
  factory: process.env.NEXT_PUBLIC_CAMPAIGN_FACTORY_ADDRESS || "",
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
  code: string;
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
  goalAmount: string,
  signer: ethers.Signer,
  title: string,
  description: string,
  code?: string
): Promise<string> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    signer
  );

  // Default duration of 30 days
  const durationInDays = 30;
  const campaignCode = code || generateCampaignCode();

  const tx = await factory.createCampaign(
    tokenAddress,
    goalAmount,
    durationInDays,
    title,
    description,
    campaignCode
  );
  const receipt = await tx.wait();

  // Get the campaign address from the event
  const event = receipt.events?.find(
    (e: ethers.Event) => e.event === "CampaignCreated"
  );
  if (!event) throw new Error("Campaign creation event not found");

  return event.args.campaignAddress;
}

export async function getCampaigns(): Promise<Campaign[]> {
  if (!window.ethereum) throw new Error("No Ethereum provider found");

  const ethereumProvider = new ethers.providers.Web3Provider(
    window.ethereum as ethers.providers.ExternalProvider
  );
  const factory = new ethers.Contract(
    CAMPAIGN_FACTORY_ADDRESS,
    CampaignFactoryJson.abi,
    ethereumProvider
  );

  const campaignAddresses = await factory.getAllCampaigns();

  // Get details for each campaign
  const campaignDetails = await Promise.all(
    campaignAddresses.map(async (address: string) => {
      const campaign = new ethers.Contract(
        address,
        FUND_CAMPAIGN_ABI,
        ethereumProvider
      );
      const [
        creator,
        tokenAddress,
        goal,
        raised,
        isActive,
        title,
        description,
        code,
      ] = await campaign.getCampaignDetails();
      return {
        address,
        creator,
        title,
        description,
        goal: goal.toString(),
        raised: raised.toString(),
        tokenAddress,
        isActive,
        code,
      };
    })
  );

  return campaignDetails;
}

export async function getCampaignByCode(
  code: string
): Promise<Campaign | null> {
  try {
    const allCampaigns = await getCampaigns();
    return allCampaigns.find((campaign) => campaign.code === code) || null;
  } catch (error: unknown) {
    console.error("Error getting campaign by code:", error);
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
