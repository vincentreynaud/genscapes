import React from 'react';

export default function ({ id, title, children }) {
	return (
		<div className="box col-auto" id={id}>
			<h4>{title}</h4>
			{children}
		</div>
	);
}
