import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import {Button, Input, Select, RTE} from '../index'
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import service from "../../appwrite/config";

export default function PostForm({post}){
    const {register, handleSubmit, watch, setValue, control, getValues} =useForm({
        defaultValues:{
            title: post?.title || '',
            slug: post?.slug || '',
            content: post?.content || '',
            status: post?.status || 'active'
        }
    })
    const navaigate = useNavigate()
    const userData = useSelector(state => state.user.userData)
    const submit = async(data) => {
        if(post){
            const file =  data.image[0]? service.uploadFile (data.image[0]): null
            if(file){
                service.deleteFile(post.featuredImage)
            }
            const dbPost = await service.updatePost(post.$id, {
                ...data,
                featuredImage: file ? file.$id : undefined
            })
            if(dbPost){
                navaigate(`/post/${dbPost.$id}`)
            }
        }else{
            const file = await service.uploadFile(data.image[0])
            if(file){
                const fileld = file.$id
                data.featuredImage = fileld
                const dbPost = await service.createPost({
                    ...data,
                    userId: userData.$id
                })
                if(dbPost){
                    navaigate(`/post/${dbPost.$id}`)
                }
            }
        }
    }
    const slugTransfom = useCallback(  (value) => {
        if(value && typeof value === 'string'){
        return value
            .trim()
            .toLowerCase()
            .replace(/^[a-zA-Z\d\s]+/g, '-')
            .replace(/\s/g, '-')
        return ''
        }
    }, [])

    useEffect(() => {
        const subscription = watch((value, {name}) => {
            if(name === 'title'){
                setValue('slug', slugTransfom(value.title,{shouldValidate: true}))
            }
        })
        return () => {
            subscription.unsubscribe()
        }
    }, [watch, slugTransfom, setValue])
    return(
        <form onSubmit={handleSubmit(submit)} className="flex flex-wrap">
            <div className="w-2/3 px-2">
            <Input
            label = "title:"
            placeholder = "title"
            className = 'mb-4'
            {...register('title', {required: true})}
            />
            <Input
            label = "slug:"
            placeholder = "slug"
            className = "mb-4"
            {...register('slug', {
                required: true
            })}
            onInput = {(e) => {
                setValue('slug', slugTransfom(e.currentTarget.value),{shouldValidate: true})
            }}
            />
            <RTE label="content" name = 'content' control={control} defaultValue= {getValues("content")} />
        </div>
        <div className="w-1/3 px-2">
            <Input
                label = "featured image"
                type = "file"
                className = 'mb-4'
                accept = 'image/png, image/jpg, image/jpeg, image/gif'
                {...register("image", {required: !post})}
            />
            {post && (
                <div className="w-full mb-4">
                    <img 
                    src={service.getFilePreview(post.featuredImage)} 
                    alt={post.title}
                    className="rounded-lg"
                    />
                </div>
            )}
            <Select
                options = {["active", "inactive"]}
                label = "status"
                className = "mb-4"
                {...register("status", {required: true})}
            />
            <Button type="submit" bgColor={post? "bg-green-500" : undefined}>{post? "update" : "submit"}</Button>
        
        </div>

        </form>
        
    )
}