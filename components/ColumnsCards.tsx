import React, { useEffect } from "react";
interface Props {
    title: string;
    contentList: string[];
}
const ColumnCards = ({ title, contentList }: Props) => {
    return (
        <div className="grid flex-grow gap-1">
            <div className="grid place-items-center text-lg italic">{title}</div>
            {contentList.map((content) =>
                (<div className="grid card bg-base-200 place-items-center">
                    <div className="card-body">
                        {content}
                        </div>
                </div>))
            }

        </div>
    );

};

export default ColumnCards;