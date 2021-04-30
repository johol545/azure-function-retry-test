import { AzureFunction, Context } from "@azure/functions"

const serviceBusQueueTrigger: AzureFunction = async function(context: Context, mySbMsg: any): Promise<void> {
    throw new Error("Pretend something went wrong and throw an error")
};

export default serviceBusQueueTrigger;