import styled, { css } from 'styled-components'

export const Container = styled.div`
	display: flex;
	align-items: center;
	text-align: left;
`

export const Checkbox = styled.div<{ checked: boolean }>`
	display: flex;
	align-items: center;
	min-width: 16px;
	justify-content: center;
	height: 16px;
	border-radius: 4px;
	background-color: ${props => props.theme.primaryBorderColor};

	${props => props.checked && css`
		background-color: ${props.theme.buttonActionBackgroundColor};
	`}
`

export const Title = styled.h3`
	font-size: 16px;
	font-weight: 500;
	margin-left: 10px;
	margin: 0;
`