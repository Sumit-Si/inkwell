import {ApiResponse} from "../utils/ApiResponse.js";

const healthCheck = async (req,res) => {
    res
        .status(200)
        .json(new ApiResponse(
            200,
            "All OK"
        ))
}

export {healthCheck}