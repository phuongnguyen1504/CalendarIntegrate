const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL + "/files/download/file/";

//To convert list file to Ant Design UI library criterion
const convertListFileObject = (list, isOnlyView) => {
    let arr = [];
    for (const element of list) {
        const temp = {
            fileId: element.fileId,
            name: element.fileName.substr(element.fileName.indexOf("_") + 1),
            status: 'done',
            recurringScheduleId: element.recurringScheduleId,
            url: isOnlyView?"":`${BASE_URL}${element.fileName}`,
        }
        arr.push(temp);
    }
    return arr;
}

module.exports = {
    convertListFileObject: convertListFileObject,
}