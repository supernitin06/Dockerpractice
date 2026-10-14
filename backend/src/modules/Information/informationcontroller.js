import { getinformation, postinformation } from "./informationservice.js";

export const PostInformationController = async (req,res)=>{
    try {
        const {name ,email} = req.body;
        if(!name || !email){
            return res.status(400).json({message:"all field are required"})
        }
        const result = await postinformation({ name, email });
        return res.status(200).json({message:"Information posted successfully",result});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Something went wrong"})
    }
}

export const getInformationController = async (req,res)=>{
    try {
        const result = await getinformation();
        return res.status(200).json({message:"Information fetched successfully",result});
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:"Something went wrong"})
    }
}