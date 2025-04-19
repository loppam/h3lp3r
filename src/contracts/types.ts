import { ethers } from "ethers";

export interface CampaignFactory extends ethers.Contract {
  createCampaign(
    _tokenAddress: string,
    _goalAmount: ethers.BigNumber
  ): Promise<ethers.ContractTransaction>;
  getAllCampaigns(): Promise<string[]>;
}

export interface FundCampaign extends ethers.Contract {
  fund(_amount: ethers.BigNumber): Promise<ethers.ContractTransaction>;
  withdraw(): Promise<ethers.ContractTransaction>;
  getCampaignDetails(): Promise<
    [
      string, // creator
      string, // tokenAddress
      ethers.BigNumber, // goalAmount
      ethers.BigNumber, // totalFunds
      boolean // isWithdrawn
    ]
  >;
}
