import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'
import React from 'react'

import {
	type DropzoneOptions,
	type DropzoneState,
	useDropzone,
} from 'react-dropzone'

interface DropzoneProps extends DropzoneOptions {
	containerClassName?: string
	dropZoneClassName?: string
	children?: (dropzone: DropzoneState) => React.ReactNode
	placeholder?: string
}

export const Dropzone: React.FC<DropzoneProps> = ({
	onDrop,
	accept,
	multiple = false,
	maxSize,
	maxFiles,
	containerClassName,
	dropZoneClassName,
	children,
	placeholder = 'Clique ou arraste e solte os arquivos aqui...',
	...props
}) => {
	const dropzone = useDropzone({
		accept,
		multiple,
		onDrop,
		maxSize,
		maxFiles,
		...props,
	})

	const {
		getRootProps,
		getInputProps,
		isDragActive,
		isDragAccept,
		isDragReject,
	} = dropzone

	return (
		<>
			<div className={cn('flex flex-col gap-2', containerClassName)}>
				<div
					{...getRootProps()}
					className={cn(
						'flex justify-center items-center w-full h-32 border-dashed border-2 border-border rounded-lg bg-card hover:bg-accent hover:text-accent-foreground transition-all select-none cursor-pointer',
						dropZoneClassName
					)}
				>
					<input
						data-testid="file-upload"
						{...getInputProps()}
					/>
					{children ? (
						children(dropzone)
					) : (
						<RenderDragMessage
							isDragActive={isDragActive}
							isDragReject={isDragReject}
							isDragAccept={isDragAccept}
							maxSize={maxSize}
							placeholder={placeholder}
						/>
					)}
				</div>
			</div>
		</>
	)
}

interface RenderDragMessageProps {
	isDragActive: boolean
	isDragReject: boolean
	isDragAccept: boolean
	maxSize?: number
	accept?: string
	placeholder?: string
}

const RenderDragMessage: React.FC<RenderDragMessageProps> = ({
	isDragActive,
	isDragReject,
	isDragAccept,
	maxSize,
	placeholder = 'Clique ou arraste e solte os arquivos aqui...',
}) => {
	if (isDragAccept) {
		return <span className="border-success">Solte os arquivo(s)...</span>
	}

	if (isDragReject) {
		return (
			<span className="border-danger text-danger">
				Arquivo(s) não suportado...
			</span>
		)
	}

	if (!isDragActive) {
		return (
			<div className="flex items-center flex-col gap-1.5">
				<div className="flex items-center flex-row gap-0.5 text-sm font-medium">
					<Icon
						name="upload"
						className="mr-2 h-4 w-4"
					/>
					{placeholder}
				</div>
				{maxSize && (
					<div className="text-xs text-muted-foreground font-medium">
						Tamanho máximo: {(maxSize / (1024 * 1024)).toFixed(2)} MB
					</div>
				)}
			</div>
		)
	}

	return <span className="text-muted-foreground">Solte os arquivos...</span>
}
