import React, { useEffect, useState } from "react";


const EventDate = ({ timestamp }) => {
    const [day, setDay] = useState('');

    useEffect(() => {

    const convertDate = async (date) => {
        try {
            let converted = new Date(Number(date) * 1000);
            let year = (converted.getUTCFullYear() + 54);
            let month = (converted.getMonth() + 6);
            let day = converted.getDate();
            let hour = converted.getUTCHours();
            let minute = converted.getMinutes();
            let newDate = `${day}-${month}`;
            setDay(newDate);
        } catch (error) { console.log(error); }
        }
        convertDate(timestamp);
    }, []);


    return (
        <>
            <span class="text-right text-primary date">{day}</span>
        </>
        )
}
export default EventDate;